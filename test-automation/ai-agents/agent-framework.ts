/**
 * 🤖 Multi-Agent AI QA System Framework
 * 
 * This framework enables multiple AI agents (representing different QA personas)
 * to work in parallel on testing tasks while sharing information and collaborating.
 */

export interface AgentMessage {
  from: string;
  to: string | 'ALL';
  type: 'task' | 'result' | 'question' | 'recommendation' | 'alert';
  content: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  data: any;
  dependencies: string[];
  results?: any;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Central Communication Hub for AI Agents
 */
export class AgentCommunicationHub {
  private agents: Map<string, BaseQAAgent> = new Map();
  private messages: AgentMessage[] = [];
  private tasks: Map<string, AgentTask> = new Map();
  private sharedKnowledge: Map<string, any> = new Map();
  private collaborationLog: string[] = [];

  registerAgent(agent: BaseQAAgent): void {
    this.agents.set(agent.getId(), agent);
    agent.setCommunicationHub(this);
    this.log(`🤖 Agent ${agent.getId()} (${agent.getRole()}) joined the collaboration`);
  }

  sendMessage(message: AgentMessage): void {
    this.messages.push(message);
    this.log(`📨 ${message.from} → ${message.to}: ${message.type} (${message.priority})`);
    
    if (message.to === 'ALL') {
      // Broadcast to all agents
      this.agents.forEach(agent => {
        if (agent.getId() !== message.from) {
          agent.receiveMessage(message);
        }
      });
    } else {
      // Send to specific agent
      const targetAgent = this.agents.get(message.to);
      if (targetAgent) {
        targetAgent.receiveMessage(message);
      }
    }
  }

  assignTask(task: AgentTask): void {
    this.tasks.set(task.id, task);
    const agent = this.agents.get(task.assignedTo);
    if (agent) {
      agent.assignTask(task);
      this.log(`📋 Task ${task.id} assigned to ${task.assignedTo}: ${task.description}`);
    }
  }

  completeTask(task: AgentTask): void {
    this.log(`✅ Task ${task.id} completed by ${task.assignedTo}`);
    
    // Share results with all agents
    const message: AgentMessage = {
      from: task.assignedTo,
      to: 'ALL',
      type: 'result',
      content: {
        taskId: task.id,
        results: task.results,
        recommendations: this.extractRecommendations(task)
      },
      timestamp: new Date(),
      priority: 'medium'
    };
    
    this.sendMessage(message);
    this.checkDependentTasks(task.id);
  }

  private extractRecommendations(task: AgentTask): string[] {
    const recommendations: string[] = [];
    
    if (task.results?.issues) {
      recommendations.push(`Address ${task.results.issues.length} issues found in ${task.type}`);
    }
    
    if (task.results?.score && task.results.score < 80) {
      recommendations.push(`Improve ${task.type} score (current: ${task.results.score}/100)`);
    }
    
    return recommendations;
  }

  private checkDependentTasks(completedTaskId: string): void {
    this.tasks.forEach(task => {
      if (task.dependencies.includes(completedTaskId) && task.status === 'pending') {
        const allDepsCompleted = task.dependencies.every(depId => {
          const depTask = this.tasks.get(depId);
          return depTask?.status === 'completed';
        });
        
        if (allDepsCompleted) {
          this.assignTask(task);
        }
      }
    });
  }

  updateSharedKnowledge(key: string, value: any, agentId: string): void {
    this.sharedKnowledge.set(key, {
      value,
      updatedBy: agentId,
      timestamp: new Date()
    });
    
    this.log(`🧠 Knowledge updated: ${key} by ${agentId}`);
  }

  getSharedKnowledge(key: string): any {
    return this.sharedKnowledge.get(key)?.value;
  }

  getAgentStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    this.agents.forEach((agent, id) => {
      status[id] = {
        role: agent.getRole(),
        status: agent.getStatus(),
        tasksCompleted: agent.getCompletedTasksCount(),
        currentTask: agent.getCurrentTask()?.description || 'None'
      };
    });
    return status;
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.collaborationLog.push(logEntry);
    console.log(`🤖 ${logEntry}`);
  }

  generateCollaborationReport(): string {
    const report = {
      summary: {
        totalAgents: this.agents.size,
        totalMessages: this.messages.length,
        totalTasks: this.tasks.size,
        completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length
      },
      agentStatus: this.getAgentStatus(),
      recentMessages: this.messages.slice(-10),
      sharedKnowledge: Object.fromEntries(this.sharedKnowledge),
      collaborationLog: this.collaborationLog.slice(-20)
    };
    
    return JSON.stringify(report, null, 2);
  }
}

/**
 * Base AI Agent representing a QA team member
 */
export abstract class BaseQAAgent {
  protected id: string;
  protected role: string;
  protected expertise: string[];
  protected status: 'idle' | 'working' | 'collaborating' | 'blocked' = 'idle';
  protected currentTask?: AgentTask;
  protected completedTasks: AgentTask[] = [];
  protected knowledge: Map<string, any> = new Map();
  protected communicationHub?: AgentCommunicationHub;

  constructor(id: string, role: string, expertise: string[]) {
    this.id = id;
    this.role = role;
    this.expertise = expertise;
  }

  getId(): string {
    return this.id;
  }

  getRole(): string {
    return this.role;
  }

  getStatus(): string {
    return this.status;
  }

  getCurrentTask(): AgentTask | undefined {
    return this.currentTask;
  }

  getCompletedTasksCount(): number {
    return this.completedTasks.length;
  }

  setCommunicationHub(hub: AgentCommunicationHub): void {
    this.communicationHub = hub;
  }

  assignTask(task: AgentTask): void {
    if (this.status === 'working') {
      this.sendMessage({
        to: 'ALL',
        type: 'alert',
        content: `Agent ${this.id} is busy with task ${this.currentTask?.id}. Task ${task.id} queued.`,
        timestamp: new Date(),
        priority: 'medium'
      });
      return;
    }

    this.currentTask = task;
    this.status = 'working';
    task.status = 'in-progress';
    
    this.log(`📋 Starting task: ${task.description}`);
    this.executeTask(task).catch(error => {
      this.log(`❌ Task failed: ${error.message}`);
      this.status = 'blocked';
    });
  }

  protected abstract executeTask(task: AgentTask): Promise<void>;

  protected completeTask(results: any): void {
    if (this.currentTask) {
      this.currentTask.status = 'completed';
      this.currentTask.results = results;
      this.currentTask.completedAt = new Date();
      
      this.completedTasks.push(this.currentTask);
      
      if (this.communicationHub) {
        this.communicationHub.completeTask(this.currentTask);
      }
      
      this.log(`✅ Completed task: ${this.currentTask.description}`);
      this.currentTask = undefined;
      this.status = 'idle';
    }
  }

  receiveMessage(message: AgentMessage): void {
    this.log(`📨 Received ${message.type} from ${message.from}`);
    this.handleMessage(message);
  }

  protected abstract handleMessage(message: AgentMessage): void;

  protected sendMessage(message: Omit<AgentMessage, 'from'>): void {
    const fullMessage: AgentMessage = {
      from: this.id,
      ...message
    };
    
    if (this.communicationHub) {
      this.communicationHub.sendMessage(fullMessage);
    }
  }

  protected updateKnowledge(key: string, value: any): void {
    this.knowledge.set(key, value);
    
    if (this.communicationHub) {
      this.communicationHub.updateSharedKnowledge(key, value, this.id);
    }
  }

  protected getSharedKnowledge(key: string): any {
    return this.communicationHub?.getSharedKnowledge(key);
  }

  protected log(message: string): void {
    console.log(`🤖 [${this.role}:${this.id}] ${message}`);
  }

  async requestCollaboration(expertise: string[], question: string): Promise<void> {
    this.status = 'collaborating';
    
    this.sendMessage({
      to: 'ALL',
      type: 'question',
      content: {
        requestedExpertise: expertise,
        question: question,
        context: this.currentTask?.description
      },
      timestamp: new Date(),
      priority: 'high'
    });
    
    this.log(`❓ Requesting collaboration: ${question}`);
  }
}