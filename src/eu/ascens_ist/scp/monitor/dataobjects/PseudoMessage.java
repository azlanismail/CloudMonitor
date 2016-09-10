/*
 * This file belongs to the Science Cloud Platform (SCP) Implementation of the
 * Autonomic Cloud Case Study of the ASCENS EU project.
 *
 * For more information, see http://ascens-ist.eu/cloud.
 *
 */
package eu.ascens_ist.scp.monitor.dataobjects;

/**
 * Server side pseudo-representation of a message.
 * 
 * @author E. Englmeier
 * 
 */
public class PseudoMessage {

	private String fullStringIdFrom;

	private String fullStringIdTo;

	private String msgType;

	private long currentTime;

	public PseudoMessage(String from, String to, String type, long currentTime) {
		this.setFrom(from);
		this.setType(type);
		this.setTo(to);
		this.setCurrentTime(currentTime);
	}


	public String getFrom() {
		return fullStringIdFrom;
	}

	public void setFrom(String from) {
		this.fullStringIdFrom= from;
	}

	public String getTo() {
		return fullStringIdTo;
	}

	public void setTo(String to) {
		this.fullStringIdTo= to;
	}

	public String getType() {
		return msgType;
	}

	public void setType(String type) {
		this.msgType= type;
	}

	public long getCurrentTime() {
		return currentTime;
	}

	public void setCurrentTime(long currentTime) {
		this.currentTime= currentTime;
	}

	@Override
	public String toString() {
		return getType() + " from " + getFrom() + " to " + getTo() + " time " + getCurrentTime();
	}

}
