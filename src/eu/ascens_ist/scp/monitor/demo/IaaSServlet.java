/*
 * This file belongs to the Science Cloud Platform (SCP) Implementation of the
 * Autonomic Cloud Case Study of the ASCENS EU project.
 *
 * For more information, see http://ascens-ist.eu/cloud.
 *
 */
package eu.ascens_ist.scp.monitor.demo;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;

import eu.ascens_ist.scp.monitor.Configuration;
import eu.ascens_ist.scp.monitor.NodeInfoHandler;
import eu.ascens_ist.scp.monitor.dataobjects.PseudoNode;

public class IaaSServlet extends HttpServlet {
	private final Logger log = Logger.getLogger("IaaSServlet");
	private static final long serialVersionUID = 1L;

	private NodeInfoHandler nodeHandler;

	public IaaSServlet(NodeInfoHandler nodeHandler) {
		super();
		this.nodeHandler = nodeHandler;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String target = req.getServletPath();
		log.debug(target);

		if (target.equals("/scpAppliance")) {
			ServletOutputStream output = resp.getOutputStream();

			resp.setStatus(HttpServletResponse.SC_OK);
			resp.setContentType("text/html;charset=utf-8");
			String applianceId = Configuration.ZIMORY_APPLIANCE_ID + "";
			output.write(applianceId.getBytes(Charset.forName("UTF-8")));
			output.close();
		}
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String target = request.getServletPath();
		log.debug("Request: method: " + request.getMethod() + " target: " + target);

		if (target.contains("/api")) {
			String responseString = "";
			if (target.equals("/api/setHighCPU")) {
				Map<String, PseudoNode> nodes = this.nodeHandler.getNodes();
				for (String nodeId : nodes.keySet()) {
					this.setCPULoad(nodeId, 90.0);
					this.setUnvirtualized(nodeId);
				}
			} else if (target.equals("/api/deployApp")) {
				try {
					this.deployApp(request.getParameter("app"));
				} catch (URISyntaxException e) {
					log.error("Could not deploy app");
				}
			} else if (target.equals("/api/lowerCPU")) {
				this.lowerCPU(request.getParameter("app"));

			} else if (target.equals("/api/undeployApp")) {
				this.undeployApp(request.getParameter("app"));

			} else if (target.equals("/api/resetCPULoad")) {
				Map<String, PseudoNode> nodes = this.nodeHandler.getNodes();
				for (String nodeId : nodes.keySet()) {
					this.resetCPULoad(nodeId);
				}
			}

			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("text/html;charset=utf-8");
			response.getWriter().write(responseString);

		}
	}

	private void lowerCPU(String appJarName) throws IOException {
		String appName = FilenameUtils.removeExtension(appJarName);
		String inititatorNodeId = this.initiatorForAppName(appName);
		String executorNodeId = this.executorForAppName(appName);
		if (inititatorNodeId == null)
			inititatorNodeId = "";
		if (executorNodeId == null)
			executorNodeId = "";

		Map<String, PseudoNode> nodes = this.nodeHandler.getNodes();
		List<String> randomNodeSet = new ArrayList<>();

		for (String nodeId : nodes.keySet()) {
			if (!nodeId.equals(inititatorNodeId) && !nodeId.equals(executorNodeId))
				randomNodeSet.add(nodeId);
		}

		if (!randomNodeSet.isEmpty()) {
			Random random = new Random();
			String randomNodeId = randomNodeSet.get(random.nextInt(randomNodeSet.size()));
			this.setCPULoad(randomNodeId, 30.0);
		}
	}

	private void setCPULoad(String nodeId, double load) throws IOException {
		String body = "cpuLoad=" + load;
		URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/api/cpuLoad");
		postRequest(requestURL, body);
	}

	private void setUnvirtualized(String nodeId) throws IOException {
		String body = "virtualized=false";
		URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/api/virtualized");
		postRequest(requestURL, body);
	}

	private void resetCPULoad(String nodeId) throws IOException {
		String body = "virtualized=false";
		URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/api/resetNode");
		postRequest(requestURL, body);
	}

	public void deployApp(String appJarName) throws IOException, URISyntaxException {
		InputStream appStream = this.getClass().getResourceAsStream("/apps/" + appJarName);

		if (appStream != null) {

			String attachmentFileName = appJarName;
			String attachmentName = FilenameUtils.removeExtension(attachmentFileName);
			String crlf = "\r\n";
			String twoHyphens = "--";
			String boundary = "*****";

			String nodeId = this.randomNodeId();

			if (nodeId != null) {

				HttpURLConnection con = null;
				URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/app/uploadApp.html");
				con = (HttpURLConnection) requestURL.openConnection();
				con.setUseCaches(false);
				con.setDoOutput(true);

				con.setRequestMethod("POST");
				con.setRequestProperty("Connection", "Keep-Alive");
				con.setRequestProperty("Cache-Control", "no-cache");
				con.setRequestProperty("Content-Type", "multipart/form-data;boundary=" + boundary);

				DataOutputStream request = new DataOutputStream(con.getOutputStream());

				request.writeBytes(twoHyphens + boundary + crlf);
				request.writeBytes("Content-Disposition: form-data; name=\"" + attachmentName + "\";filename=\"" + attachmentFileName + "\"" + crlf);
				request.writeBytes(crlf);

				ByteArrayOutputStream bos = new ByteArrayOutputStream();
				byte[] buf = new byte[1024];
				for (int readNum; (readNum = appStream.read(buf)) != -1;) {
					bos.write(buf, 0, readNum);

				}
				appStream.close();

				byte[] bytes = bos.toByteArray();

				request.write(bytes);

				request.writeBytes(crlf);
				request.writeBytes(twoHyphens + boundary + twoHyphens + crlf);

				request.flush();
				request.close();
				con.getResponseCode();
				con.disconnect();
			}
		} else {
			log.error("App " + appJarName + " could not be found");
		}
	}

	private void undeployApp(String appJarName) throws IOException {
		String appName = FilenameUtils.removeExtension(appJarName);

		String nodeId = this.randomNodeId();

		if (nodeId != null) {
			HttpURLConnection con = null;
			URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/app/delete/" + appName);
			con = (HttpURLConnection) requestURL.openConnection();
			con.setUseCaches(false);
			con.setRequestMethod("POST");
			con.getResponseCode();
			con.disconnect();
		}
	}

	private void postRequest(URL url, String body) throws IOException {
		HttpURLConnection con = null;
		con = (HttpURLConnection) url.openConnection();
		con.setRequestMethod("POST");
		con.setUseCaches(false);

		con.setDoOutput(true);
		con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
		con.setRequestProperty("Content-Length", String.valueOf(body.length()));
		OutputStreamWriter writer = new OutputStreamWriter(con.getOutputStream());
		writer.write(body);
		writer.flush();
		writer.close();
		con.getResponseCode();
		con.disconnect();
	}

	private String randomNodeId() {
		Map<String, PseudoNode> nodes = this.nodeHandler.getNodes();
		if (nodes.isEmpty())
			return null;

		Random random = new Random();
		List<String> keys = new ArrayList<String>(nodes.keySet());
		String randomKey = keys.get(random.nextInt(keys.size()));

		return randomKey;
	}

	private String initiatorForAppName(String appName) {
		Map<String, PseudoNode> nodes = this.nodeHandler.getNodes();
		if (nodes.isEmpty())
			return null;

		for (String nodeId : nodes.keySet()) {
			PseudoNode node = nodes.get(nodeId);
			if (node.hasRoleForApp(appName, "Initiator"))
				return nodeId;
		}

		return null;
	}

	private String executorForAppName(String appName) {
		Map<String, PseudoNode> nodes = this.nodeHandler.getNodes();
		if (nodes.isEmpty())
			return null;

		for (String nodeId : nodes.keySet()) {
			PseudoNode node = nodes.get(nodeId);
			if (node.hasRoleForApp(appName, "Executor"))
				return nodeId;
		}

		return null;
	}

}
