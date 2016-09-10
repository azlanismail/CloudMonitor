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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;

import eu.ascens_ist.scp.monitor.Configuration;
import eu.ascens_ist.scp.monitor.NodeInfoHandler;
import eu.ascens_ist.scp.monitor.dataobjects.PseudoNode;

public class VoluntaryServlet extends HttpServlet {
	private final Logger log = Logger.getLogger("VoluntaryServlet");
	private static final long serialVersionUID = 1L;

	private NodeInfoHandler nodeHandler;

	public VoluntaryServlet(NodeInfoHandler nodeHandler) {
		super();
		this.nodeHandler = nodeHandler;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String target = req.getServletPath();
		log.info(target);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String target = request.getServletPath();
		log.debug("Request: method: " + request.getMethod() + " target: " + target);

		if (target.contains("/api")) {
			String responseString = "";
			if (target.equals("/api/deployApp")) {

				try {
					this.deployApp(request.getParameter("app"));
				} catch (IOException | URISyntaxException e) {
					log.error("Could not deploy app");
				}
			} else if (target.equals("/api/initiatorFail")) {

				try {
					this.initiatorFail(request.getParameter("app"));
				} catch (IOException e) {
					log.error("Could not fail initiator");
				}
			} else if (target.equals("/api/executorFail")) {

				try {
					this.executorFail(request.getParameter("app"));
				} catch (IOException e) {
					log.error("Could not fail initiator");
				}
			} else if (target.equals("/api/undeployApp")) {

				try {
					this.undeployApp(request.getParameter("app"));
				} catch (IOException e) {
					log.error("Could not undeploy app");
				}
			} else if (target.equals("/api/newInitiator")) {

				try {
					this.newInitiator(request.getParameter("app"));
				} catch (IOException e) {
					log.error("Could not undeploy app");
				}
			}

			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("text/html;charset=utf-8");
			response.getWriter().write(responseString);
		}
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

	private void initiatorFail(String appJarName) throws IOException {
		String appName = FilenameUtils.removeExtension(appJarName);

		String nodeId = this.initiatorForAppName(appName);

		if (nodeId != null) {
			HttpURLConnection con = null;
			URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/api/shutdown");
			con = (HttpURLConnection) requestURL.openConnection();
			con.setUseCaches(false);
			con.setRequestMethod("POST");
			con.getResponseCode();
			con.disconnect();
		}
	}

	private void executorFail(String appJarName) throws IOException {
		String appName = FilenameUtils.removeExtension(appJarName);

		String nodeId = this.executorForAppName(appName);

		if (nodeId != null) {
			HttpURLConnection con = null;
			URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/api/shutdown");
			con = (HttpURLConnection) requestURL.openConnection();
			con.setUseCaches(false);
			con.setRequestMethod("POST");
			con.getResponseCode();
			con.disconnect();
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

	private void newInitiator(String appJarName) throws IOException {
		String appName = FilenameUtils.removeExtension(appJarName);

		String nodeId = this.initiatorForAppName(appName);

		if (nodeId != null) {
			String newId = "";
			int port = 0;
			if (appName.equals("Exchange")) {
				newId = "2216897C906E5651ACEA32ABDE5C3AEDC7EA135B";
				port = 9320;
			} else if (appName.equals("Chatapp")) {
				newId = "0E41E2A951DBD0AF394CE3A9500097EB10C0BD80";
				port = 9330;
			}
			if (!newId.equals("")) {
				String body = "nodeId=" + newId + "port=" + port;

				HttpURLConnection con = null;
				URL requestURL = new URL("HTTP", "localhost", Configuration.MONITOR_PORT, "/nodeInfo/" + nodeId + "/api/startLocalNode");
				con = (HttpURLConnection) requestURL.openConnection();
				con.setUseCaches(false);
				con.setDoOutput(true);

				con.setRequestMethod("POST");
				con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
				con.setRequestProperty("Content-Length", String.valueOf(body.length()));
				con.setDoOutput(true);
				OutputStreamWriter writer = new OutputStreamWriter(con.getOutputStream());
				writer.write(body);
				writer.flush();

				con.getResponseCode();
				con.disconnect();
			}
		}
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
