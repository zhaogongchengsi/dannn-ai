import type { Observable } from 'rxjs'
import type { Server as IOServer, Socket } from 'socket.io'
import type { Logger } from '../../shared/logger'
import type { RegisterServiceMessage, ServiceListRequest, ServiceListResponse, ServiceRegistrationResponse } from '../../shared/protocols/discovery'
import type { McpServer } from '../server'
import { Subject } from 'rxjs'

export interface ServiceInfo {
  serviceId: string
  methods: Set<string>
  metadata?: Record<string, any>
  socket?: Socket
}

export class ServiceRegistry {
  private services = new Map<string, ServiceInfo>()
  private change$ = new Subject<void>()
  server: McpServer
  logger: Logger
  socket: IOServer | undefined

  constructor(server: McpServer) {
    this.server = server
    this.logger = server.getLogger()
    this.socket = server.getSocket()
    this.socket.on('connection', (socket) => {
      this.handleConnection(socket)
    })
  }

  private handleConnection(socket: Socket) {
    this.handleSystemGetServices(socket)
    this.handleSystemRegister(socket)
  }

  private handleSystemGetServices(socket: Socket) {
    socket.on('system-get-services', (message: ServiceListRequest) => {
      const services = this.getServices()

      this.logger.info(`[MCP Server] Sending service list to ${socket.id}`, services)

      const response: ServiceListResponse = {
        services,
        type: 'system',
        action: 'serviceList',
        id: message.id,
        version: message.version,
        timestamp: Date.now(),
      }

      // 发送服务列表给客户端
      socket.emit('system-get-services-response', response)
    })
  }

  /**
   * 处理系统注册消息
   * @param socket Socket 实例
   */
  private handleSystemRegister(socket: Socket) {
    socket.on('system-register', (message: RegisterServiceMessage) => {
      if (!message.serviceId || !Array.isArray(message.methods)) {
        this.logger.warn('[MCP Server] Invalid register service message', message)
        return
      }

      this.logger.info(`[MCP Server] Registering service: ${message.serviceId}`)

      // 调用服务注册逻辑，假设你有一个 registerService 方法
      this.registerService(message, socket)

      const serviceInfo: ServiceRegistrationResponse = {
        type: 'system',
        action: 'registerResponse',
        success: true,
        serviceId: message.serviceId,
        id: message.id,
        version: message.version,
        timestamp: Date.now(),
      }

      // 你可以给客户端反馈一个确认消息，比如：
      socket.emit('system-registered-response', serviceInfo)
    })
  }

  registerService(message: RegisterServiceMessage, socket: Socket) {
    this.register(
      message.serviceId,
      message.methods,
      message.metadata,
      socket,
    )
  }

  register(serviceId: string, methods: string[], metadata?: Record<string, any>, socket?: Socket) {
    let service = this.services.get(serviceId)
    if (!service) {
      service = { serviceId, methods: new Set(), metadata, socket }
      this.services.set(serviceId, service)
    }
    methods.forEach(m => service!.methods.add(m))
    this.change$.next()
  }

  getServices(): (Omit<ServiceInfo, 'methods'> & { methods: string[] })[] {
    return Array.from(this.services.values()).map(s => ({
      serviceId: s.serviceId,
      methods: Array.from(s.methods),
      metadata: s.metadata,
    }))
  }

  onChange(): Observable<void> {
    return this.change$.asObservable()
  }
}
