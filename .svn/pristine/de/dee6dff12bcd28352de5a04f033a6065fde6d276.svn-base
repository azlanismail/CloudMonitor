/*
 * This file belongs to the Science Cloud Platform (SCP) Implementation of the
 * Autonomic Cloud Case Study of the ASCENS EU project.
 *
 * For more information, see http://ascens-ist.eu/cloud.
 *
 */
package eu.ascens_ist.scp.monitor;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URL;
import java.net.UnknownHostException;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import eu.ascens_ist.scp.iaas.zimory.ZimoryConnection;
import eu.ascens_ist.scp.iaas.zimory.ZimoryException;

/**
 * Configuration values for MonitorServer
 * 
 * @author A. Dittrich
 * 
 */
public class Configuration {
	private static Logger log = Logger.getLogger("Configuration");

	/**
	 * Port of MonitorServer to whom nodes send their NodeInfo
	 */
	public static int MONITOR_PORT = 8181;
	/**
	 * IP/Host of Zimory API
	 */
	public static String ZIMORY_API_IP = ""; // EnvironmentSensor.getVirtualized() ? "10.153.3.181" : "129.187.228.133";
	/**
	 * Path on Zimory Server for API
	 */
	public static String ZIMORY_BASE_API_STRING = ""; // "/ZimoryManage/services/api/";
	/**
	 * Path for certificate for communication with zimory relative to
	 * monitor.jar location
	 */
	public static URL ZIMORY_CERT_PATH = null;
	/**
	 * Password for certificate for communication with zimory relative to
	 * monitor.jar location
	 */
	public static String ZIMORY_CERT_PASS = "";
	/**
	 * ID of Appliances for Deployments in Zimory Software
	 */
	public static int ZIMORY_APPLIANCE_ID = 0;// 24
	/**
	 * ID of Network for Deployments in Zimory Software
	 */
	public static int ZIMORY_NETWORK_ID = 0;// 8

	private static boolean validZimoryHost = false;
	private static boolean zimoryValidityChecked = false;

	/**
	 * Reads configuration for MonitorServer from given String
	 * 
	 * @param config
	 *            String representation of configuration: Each line contains one
	 *            configuration pair, key and value separated by a colon
	 */
	public static void readConfigurationString(String config) {
		String[] configPairs = config.split("\n");

		for (String configPair : configPairs) {
			if (configPair.trim().equals("") || configPair == null)
				continue;

			configPair = StringUtils.substringBefore(configPair, "#");

			String[] pair = configPair.split(":");
			if (pair.length != 2)
				continue;

			String key = pair[0].trim();
			String value = pair[1].trim();
			log.info("Value " + value + " for key \"" + key + "\"");

			if (key.equals("MonitorPort")) {
				Integer port = validateInteger(key, value);
				if (port != null)
					MONITOR_PORT = port;

			} else if (key.equals("ZimoryServer")) {
				InetAddress address = validateInetAddress(key, value);
				if (address != null)
					ZIMORY_API_IP = address.getHostName();

			} else if (key.equals("ZimoryAPIPath")) {
				ZIMORY_BASE_API_STRING = value;

			} else if (key.equals("ZimoryCertPath")) {
				try {
					File certFile = new File(value);
					if (certFile.exists())
						ZIMORY_CERT_PATH = certFile.toURI().toURL();
					else {
						ClassLoader loader = Thread.currentThread().getContextClassLoader();
						URL url = loader.getResource(value);
						if (url != null) {
							ZIMORY_CERT_PATH = url;
						} else {
							log.error("Certification file could not be read");
						}
					}
				} catch (IOException e) {
					ClassLoader loader = Thread.currentThread().getContextClassLoader();
					URL url = loader.getResource(value);
					if (url != null) {
						ZIMORY_CERT_PATH = url;
					} else {
						log.error("Certification file could not be read");
					}
				}

			} else if (key.equals("ZimoryCertPass")) {
				ZIMORY_CERT_PASS = value;

			} else if (key.equals("ZimoryAppliance")) {
				Integer id = validateInteger(key, value);
				if (id != null)
					ZIMORY_APPLIANCE_ID = id;

			} else if (key.equals("ZimoryNetwork")) {
				Integer id = validateInteger(key, value);
				if (id != null)
					ZIMORY_NETWORK_ID = id;

			} else {
				log.error("Key \"" + key + "\" is no valid key");
			}
		}

		if (validIaasConnection()) {
			log.info("Configuration has valid connection credentials for zimory software.");
		}
	}

	private static void logValueError(String key, String value, String error) {
		log.error("Value " + value + " for key \"" + key + "\" " + error);
	}

	private static InetAddress validateInetAddress(String key, String value) {
		InetAddress address = null;
		try {
			address = InetAddress.getByName(value);
		} catch (UnknownHostException e) {
			logValueError(key, value, "is no valid IP-Address/Hostname");
		}
		return address;
	}

	private static Integer validateInteger(String key, String value) {
		return validateInteger(key, value, 1);
	}

	private static Integer validateInteger(String key, String value, int minValue) {
		try {
			int port = Integer.parseInt(value);
			if (port >= minValue) {
				return port;
			} else {
				logValueError(key, value, "must be greater than " + minValue);
			}
		} catch (NumberFormatException e) {
			logValueError(key, value, "is no valid integer");
		}
		return null;
	}

	public static boolean validIaasConnection() {
		if (!zimoryValidityChecked) {
			try {
				ZimoryConnection conn = new ZimoryConnection(ZIMORY_API_IP, ZIMORY_BASE_API_STRING, ZIMORY_CERT_PATH, ZIMORY_CERT_PASS, ZIMORY_APPLIANCE_ID, ZIMORY_NETWORK_ID);
				validZimoryHost = conn.canConnect();
			} catch (UnknownHostException | ZimoryException e) {
				validZimoryHost = false;
			}
			zimoryValidityChecked = true;
		}
		return validZimoryHost;
	}
}
