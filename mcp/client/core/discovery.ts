import type { Logger } from '../../shared/logger'
import type {
  RegisterServiceMessage,
  ServiceListRequest,
  ServiceListResponse,
  ServiceRegistrationResponse,
} from '../../shared/protocols/discovery'
import type { MessageHandler } from '../core/message-handler'
import type { Connection } from './connection'
import { nanoid } from 'nanoid'

export class Discovery {
  constructor(
    private connection: Connection,
    private messageHandler: MessageHandler,
    private logger: Logger,
  ) {
    // 注册响应处理器
    this.messageHandler.registerResponseHandler(
      'system-get-services-response',
      (response: ServiceListResponse) => response.id,
      (response: ServiceListResponse) => response.services,
      (response: ServiceListResponse) => response.error || null,
    )

    this.messageHandler.registerResponseHandler(
      'system-registered-response',
      (response: ServiceRegistrationResponse) => response.id,
      (response: ServiceRegistrationResponse) => response.success,
      (response: ServiceRegistrationResponse) => response.error || null,
    )
  }

  /**
   * 注册一个服务
   */
  public async registerService(
    serviceId: string,
    methods: string[],
    metadata?: Record<string, any>,
  ): Promise<ServiceRegistrationResponse> {
    const id = nanoid()
    const message: RegisterServiceMessage = {
      id,
      type: 'system',
      action: 'register',
      version: '1.0',
      timestamp: Date.now(),
      serviceId,
      methods,
      metadata,
    }

    this.logger.info(`[MCP Discovery] Registering service ${serviceId}`)
    return await this.messageHandler.sendRequest<ServiceRegistrationResponse>(
      'system-register',
      message,
    )
  }

  /**
   * 请求服务列表
   */
  public async getServiceList(): Promise<ServiceListResponse['services']> {
    const id = nanoid()
    const request: ServiceListRequest = {
      id,
      type: 'system',
      action: 'getServices',
      version: '1.0',
      timestamp: Date.now(),
    }

    this.logger.info('[MCP Discovery] Requesting service list')
    const response = await this.messageHandler.sendRequest<ServiceListResponse['services']>(
      'system-get-services',
      request,
    )
    return response
  }
}
