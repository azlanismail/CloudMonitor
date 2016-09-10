/*
 * This file belongs to the Science Cloud Platform (SCP) Implementation of the
 * Autonomic Cloud Case Study of the ASCENS EU project.
 *
 * For more information, see http://ascens-ist.eu/cloud.
 *
 */
package eu.ascens_ist.scp.monitor;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;

import eu.ascens_ist.scp.monitor.dataobjects.PseudoMessage;
import eu.ascens_ist.scp.monitor.dataobjects.PseudoNode;

/**
 * 
 * Handles both POST of data (from the network nodes) as well as GET of data
 * (from the JS visualization)
 * 
 * @author E. Englmeier, A. Dittrich
 * 
 */
public class NodeInfoHandler extends AbstractHandler {
	private final static Logger log = Logger.getLogger("NodeInfoHandler");

	private final Gson gson = new Gson();

	private boolean filterUnimportantHelenaMessages = true;

	private Map<String, PseudoNode> nodes = new ConcurrentHashMap<String, PseudoNode>();
	private List<PseudoMessage> messages = new CopyOnWriteArrayList<PseudoMessage>();

	private final int nodeExpirationMillis = 10000;
	private final int messageExpirationMillis = 2000;

	public Map<String, PseudoNode> getNodes() {
		return nodes;
	}

	@Override
	public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		log.debug("Request: method: " + request.getMethod() + " target: " + target);
		removeExpired();
		if (!target.substring(1).equals("")) { // request for specific node; request is forwarded
			this.forwardRequest(target, request, response);
		} else if (baseRequest.getMethod().equals("GET")) { // GET-Request from visualization
			this.returnData(response);
		} else if (baseRequest.getMethod().equals("POST")) { // POST-Request from MonitorClient on SCPi
			this.handleClientInfo(request, response);
		}

		baseRequest.setHandled(true);
	}

	/**
	 * Handles request forwarding to specific node.
	 * 
	 * @param target
	 * @param baseRequest
	 * @param request
	 * @param response
	 * @throws IOException
	 */

	private void forwardRequest(String target, HttpServletRequest request, HttpServletResponse response) throws IOException {
		target = target.substring(1);

		PseudoNode requestedNode = null;
		for (String nodeId : nodes.keySet()) {
			if (nodeId.equals(target.split("/")[0])) {
				requestedNode = nodes.get(nodeId);
			}
		}

		if (requestedNode != null) {
			target = target.replaceAll(requestedNode.getFullId() + "/", "");
			target = target.replaceAll("node/res", "res");
			target = target.replaceAll("app/res", "res");
			target = target.replaceAll("app/info/res", "res");
			URL requestURL = new URL("HTTP", requestedNode.getAddress(), requestedNode.getPort() + 1000, "/" + target);
			HttpURLConnection con = (HttpURLConnection) requestURL.openConnection();
			con.setRequestMethod(request.getMethod());
			con.setRequestProperty("Content-Type", request.getContentType());
			con.setDoInput(true);

			if (request.getMethod() == "POST") {
				con.setDoOutput(true);
				con.setRequestProperty("Content-Length", request.getContentLength() + "");
				IOUtils.copy(request.getInputStream(), con.getOutputStream());
			}

			IOUtils.copy(con.getInputStream(), response.getOutputStream());
		} else
			response.getWriter().write("Requested node was not found.");
	}

	/**
	 * Handles data request from visualization websites.
	 * 
	 * @param target
	 * @param request
	 * @param response
	 * @throws IOException
	 */

	private void returnData(HttpServletResponse response) throws IOException {
		// Nodes
		List<PseudoNode> nodeList = new ArrayList<PseudoNode>(nodes.values());
		Collections.sort(nodeList);
		response.getWriter().write("{\"nodes\":" + gson.toJson(nodeList));
		// Messages
		response.getWriter().write(",\"messages\":");
		response.getWriter().write(gson.toJson(messages));
		response.getWriter().write(",\"config\":{");
		response.getWriter().write("\"IaaS\":" + Configuration.validIaasConnection());
		response.getWriter().write("}");
		response.getWriter().write("}");
	}

	/**
	 * Handles posted data from SCPi.
	 * 
	 * @param target
	 * @param request
	 * @param response
	 * @throws IOException
	 */

	private void handleClientInfo(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String receivedData = getData(request);
		log.debug(receivedData);
		try {
			if (receivedData.equals("ping")) { // Request if server is still alive; response with pong
				response.getWriter().write("pong");
			} else {
				JSONObject obj = new JSONObject(receivedData);
				long currentTime = new Date().getTime();

				if (obj.has("fullId") && obj.has("port")) { // data in request is node
					// NodeInfo
					String fullNodeId = obj.getString("fullId");
					Map<String, Map<String, String>> apps = new HashMap<>();

					if (obj.has("appRoles")) {
						// AppInfo
						JSONObject object = obj.getJSONObject("appRoles");

						for (Iterator<?> keys = object.keys(); keys.hasNext();) {
							Object thisKey = keys.next();
							if (thisKey instanceof String) {
								String appName = (String) thisKey;

								Map<String, String> appMap = new HashMap<>();
								apps.put(appName, appMap);

								JSONObject roleMap = object.getJSONObject(appName);

								for (Iterator<?> iterator = roleMap.keys(); iterator.hasNext();) {
									String roleName = (String) iterator.next();
									String roleStatus = roleMap.getString(roleName);
									appMap.put(roleName, roleStatus);
								}

							}
						}
					}
					PseudoNode p = new PseudoNode(currentTime, obj.getString("address"), obj.getInt("port"), obj.getInt("cpuCores"), obj.getInt("cpuSpeed"), obj.getString("cpuModel"),
							obj.getDouble("cpuLoad"), obj.getInt("memTotal"), obj.getInt("memUsed"), obj.getInt("memFree"), obj.getLong("diskTotal"), obj.getLong("diskFree"),
							obj.getString("location"), obj.getBoolean("virtualized"), obj.getInt("deploymentId"), obj.getBoolean("singleNode"), null, apps, fullNodeId);

					nodes.put(p.getFullId(), p);

				} else if (obj.has("msgType")) { // data in request is message
					String msgType = obj.getString("msgType");
					if (filterUnimportantHelenaMessages) {
						if (msgType.startsWith("GossipInfo") || msgType.startsWith("R2RAnswerMessage"))
							return;
					}

					PseudoMessage pmsg = new PseudoMessage(obj.getString("fullStringIdFrom"), obj.getString("fullStringIdTo"), obj.getString("msgType"), currentTime);
					if (!obj.getString("fullStringIdTo").equals("Broadcast")) {
						pmsg.setFrom(getclosestNeighbourId(pmsg.getFrom()));
						pmsg.setTo(getclosestNeighbourId(pmsg.getTo()));
					} else {
						pmsg.setFrom(getclosestNeighbourId(pmsg.getFrom()));
					}
					if (checkMessage(pmsg)) {
						messages.add(pmsg);
					}
				}
			}
		} catch (JSONException e) {
			log.warn("JSON Exception: Received String is invalid: " + e.getMessage());
		}
	}

	private boolean checkMessage(PseudoMessage pmsg) {
		for (PseudoMessage p : messages) {
			if (p.getTo().equals(pmsg.getTo()) && p.getFrom().equals(pmsg.getFrom()) && p.getType().equals(pmsg.getType())) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Removes expired Nodes and Messages from the designated lists.
	 * 
	 */
	private void removeExpired() {
		long currentTime = new Date().getTime();

		for (PseudoMessage message : messages) {
			if (message.getCurrentTime() - currentTime < -messageExpirationMillis) {
				messages.remove(message);
			}
		}

		for (PseudoNode node : nodes.values()) {
			if (node.getLastKnownTime() - currentTime < -nodeExpirationMillis) {
				nodes.remove(node.getFullId());
			}
		}
	}

	/**
	 * gets the data out of a Request and returns it as a String
	 */
	private String getData(HttpServletRequest req) {
		StringBuilder sb = new StringBuilder();
		String line;
		try {
			BufferedReader reader = req.getReader();
			do {
				line = reader.readLine();
				sb.append(line).append("\n");
			} while (line != null);
			reader.close();
		} catch (IOException e) {
		}

		String[] ar = sb.toString().split("\\n");
		return ar[0];
	}

	/**
	 * returns the closest lexicographical id out of pseudoNodes to the given id
	 * returns the given id if its an id of a node in pseudoNodes
	 */
	public String getclosestNeighbourId(String id) {
		boolean isIn = false;

		for (PseudoNode node : nodes.values()) {
			if (node.getFullId().equals(id)) {
				isIn = true;
			}
		}

		if (isIn) {
			return id;
		} else {
			List<PseudoNode> nodeList = new ArrayList<PseudoNode>(nodes.values());
			Collections.sort(nodeList);
			for (int j = 0; j < nodeList.size(); j++) {
				try {
					if (nodeList.get(j).getFullId().compareTo(id) > 0 && nodeList.get(j + 1).getFullId().compareTo(id) < 0 || nodeList.get(j).getFullId().compareTo(id) < 0
							&& nodeList.get(j + 1).getFullId().compareTo(id) > 0) {
						return nodeList.get(j).getFullId();
					}
				} catch (Exception e) {
					return nodeList.get(0).getFullId();
				}
			}
		}
		return id;

	}

}
