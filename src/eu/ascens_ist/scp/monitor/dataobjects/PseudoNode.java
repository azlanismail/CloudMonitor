/*
 * This file belongs to the Science Cloud Platform (SCP) Implementation of the
 * Autonomic Cloud Case Study of the ASCENS EU project.
 *
 * For more information, see http://ascens-ist.eu/cloud.
 *
 */
package eu.ascens_ist.scp.monitor.dataobjects;

import java.util.Map;

/**
 * Server side pseudo-representation of a node.
 * 
 * @author E. Englmeier, A. Dittrich
 * 
 */
public class PseudoNode implements Comparable<PseudoNode> {

	private String address;
	private int port;
	private Object id;
	private String fullId;
	private String shortId;
	private int cpuCores;
	private int cpuSpeed;
	private String cpuModel;
	private double cpuLoad;
	private long memTotal;
	private long memUsed;
	private long memFree;
	private long diskTotal;
	private long diskFree;
	private String location;
	private boolean virtualized;
	private int deploymentId;
	private boolean singleNode;

	private Object localStoredContent;

	private long lastKnownTime;

	private Map<String, Map<String, String>> appRoles; // Map<appName, Map<roleName, roleStatus>>

	public PseudoNode(long currentTime, String ad, int port, int cpuCores, int cpuSpeed, String cpuModel, double cpuLoad, long memTotal, long memUsed, long memFree, long diskTotal, long diskFree,
			String location, boolean virtualized, int deploymentId, boolean singleNode, Object localContent, Map<String, Map<String, String>> appRoles, String fullId) {
		this.appRoles = appRoles;

		this.setAddress(ad);
		this.setPort(port);
		this.setId(id);
		this.setCpuCores(cpuCores);
		this.setCpuSpeed(cpuSpeed);
		this.setCpuModel(cpuModel);
		this.setCpuLoad(cpuLoad);
		this.setMemTotal(memTotal);
		this.setMemUsed(memUsed);
		this.setMemFree(memFree);
		this.setDiskTotal(diskTotal);
		this.setDiskFree(diskFree);
		this.setLocation(location);
		this.setVirtualized(virtualized);
		this.setLocalStoredContent(localContent);
		this.setFullId(fullId);
		this.setDeploymentId(deploymentId);
		this.setSingleNode(singleNode);

		try {
			this.setShortId(fullId.substring(0, 6));
		} catch (Exception e) {
			try {
				this.setShortId(fullId.substring(0, 2));
			} catch (Exception e2) {
				this.setShortId(fullId.substring(0, 1));
			}
		}
		this.setLastKnownTime(currentTime);
	}

	public int getDeploymentId() {
		return deploymentId;
	}

	public void setDeploymentId(int deploymentId) {
		this.deploymentId = deploymentId;
	}

	public boolean isSingleNode() {
		return singleNode;
	}

	public void setSingleNode(boolean singleNode) {
		this.singleNode = singleNode;
	}

	public boolean isVirtualized() {
		return virtualized;
	}

	public void setVirtualized(boolean virtualized) {
		this.virtualized = virtualized;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public long getMemUsed() {
		return memUsed;
	}

	public void setMemUsed(long memUsed) {
		this.memUsed = memUsed;
	}

	public Object getLocalStoredContent() {
		return localStoredContent;
	}

	public void setLocalStoredContent(Object localStoredContent) {
		this.localStoredContent = localStoredContent;
	}

	public long getMemTotal() {
		return memTotal;
	}

	public void setMemTotal(long memTotal) {
		this.memTotal = memTotal;
	}

	public long getMemFree() {
		return memFree;
	}

	public void setMemFree(long memFree) {
		this.memFree = memFree;
	}

	public long getDiskTotal() {
		return diskTotal;
	}

	public void setDiskTotal(long diskTotal) {
		this.diskTotal = diskTotal;
	}

	public long getDiskFree() {
		return diskFree;
	}

	public void setDiskFree(long diskFree) {
		this.diskFree = diskFree;
	}

	public double getCpuLoad() {
		return cpuLoad;
	}

	public void setCpuLoad(double cpuLoad) {
		this.cpuLoad = cpuLoad;
	}

	public String getCpuModel() {
		return cpuModel;
	}

	public void setCpuModel(String cpuModel) {
		this.cpuModel = cpuModel;
	}

	public int getCpuSpeed() {
		return cpuSpeed;
	}

	public void setCpuSpeed(int cpuSpeed) {
		this.cpuSpeed = cpuSpeed;
	}

	public int getCpuCores() {
		return cpuCores;
	}

	public void setCpuCores(int cpuCores) {
		this.cpuCores = cpuCores;
	}

	public Object getId() {
		return id;
	}

	public void setId(Object id) {
		this.id = id;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getFullId() {
		return fullId;
	}

	public void setFullId(String fullId) {
		this.fullId = fullId;
	}

	public String getShortId() {
		return shortId;
	}

	public void setShortId(String shortId) {
		this.shortId = shortId;
	}

	public long getLastKnownTime() {
		return lastKnownTime;
	}

	public void setLastKnownTime(long currentTime) {
		this.lastKnownTime = currentTime;
	}

	public Map<String, Map<String, String>> getAppRoles() {
		return appRoles;
	}

	@Override
	public int compareTo(PseudoNode otherNode) {
		return this.getFullId().compareTo(otherNode.getFullId());
	}

	public boolean hasRoleForApp(String appName, String roleName) {
		for (String app : this.appRoles.keySet()) {
			if (appName.equals(app)) {
				for (String role : this.appRoles.get(app).keySet()) {
					if (roleName.equals(role))
						return true;
				}
			}
		}
		return false;
	}
}
