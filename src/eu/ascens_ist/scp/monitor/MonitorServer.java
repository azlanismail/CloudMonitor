/*
 * This file belongs to the Science Cloud Platform (SCP) Implementation of the
 * Autonomic Cloud Case Study of the ASCENS EU project.
 *
 * For more information, see http://ascens-ist.eu/cloud.
 *
 */
package eu.ascens_ist.scp.monitor;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import eu.ascens_ist.scp.monitor.demo.IaaSServlet;
import eu.ascens_ist.scp.monitor.demo.VoluntaryServlet;

/**
 * The visualization server
 * 
 * @author E. Englmeier, A. Dittrich
 * 
 */
public class MonitorServer {
	private final Logger log = Logger.getLogger("MonitorServer");

	private long currentTime;

	public MonitorServer() {

		try {
			File configFile = new File("monitor.conf");
			String config = IOUtils.toString(new FileInputStream(configFile), StandardCharsets.UTF_8);
			Configuration.readConfigurationString(config);
		} catch (IOException e) {

			try {
				ClassLoader loader = Thread.currentThread().getContextClassLoader();
				URL url = loader.getResource("monitor.conf");
				if (url != null) {
					String config = IOUtils.toString(url.openStream(), StandardCharsets.UTF_8);
					Configuration.readConfigurationString(config);
				}
			} catch (IOException e1) {
				log.error("Configuration file could not be read");
			}
		}

		if (portAvailable(Configuration.MONITOR_PORT)) {

			Server server = new Server(Configuration.MONITOR_PORT);

			/*
			 * RessourceHandler
			 */
			ResourceHandler resourceHandler = new ResourceHandler();
			resourceHandler.setDirectoriesListed(true);
			URL resBaseUrl = this.getClass().getResource("/res/");
			resourceHandler.setResourceBase(resBaseUrl.toExternalForm());
			ContextHandler resContext = new ContextHandler();
			resContext.setContextPath("/");
			resContext.setHandler(resourceHandler);

			/*
			 * NodeInfoHandler
			 */
			ContextHandler nodeInfoHandler = new ContextHandler();
			nodeInfoHandler.setContextPath("/nodeInfo");
			NodeInfoHandler nodeHandler = new NodeInfoHandler();
			nodeInfoHandler.setHandler(nodeHandler);

			/*
			 * IaaSServlet
			 */
			ServletContextHandler iaasHandler = new ServletContextHandler(ServletContextHandler.SESSIONS);
			iaasHandler.setContextPath("/iaas");
			iaasHandler.addServlet(new ServletHolder(new IaaSServlet(nodeHandler)), "/");

			/*
			 * VoluntaryServlet
			 */
			ServletContextHandler voluntaryHandler = new ServletContextHandler(ServletContextHandler.SESSIONS);
			voluntaryHandler.setContextPath("/voluntary");
			voluntaryHandler.addServlet(new ServletHolder(new VoluntaryServlet(nodeHandler)), "/");

			ContextHandlerCollection contexts = new ContextHandlerCollection();
			contexts.setHandlers(new Handler[] { resContext, nodeInfoHandler, iaasHandler, voluntaryHandler, new DefaultHandler() });
			server.setHandler(contexts);

			try {
				server.start();
				log.info("Monitor Server started");
				for (Connector connector : server.getConnectors()) {
					log.info("Monitor Server is accessible at http://" + connector.getName());
				}
			} catch (Exception e) {
				log.error("Monitor Server could not be started");
			}
		} else {
			log.error("Desired port is not available. Exiting.");
		}

	}

	public static void main(String[] args) {
		new MonitorServer();
	}

	public long getCurrentTime() {
		return currentTime;
	}

	public void setCurrentTime(long currentTime) {
		this.currentTime = currentTime;
	}

	private static boolean portAvailable(int port) {
		try (Socket ignored = new Socket("localhost", port)) {
			return false;
		} catch (IOException ignored) {
			return true;
		}
	}

}
