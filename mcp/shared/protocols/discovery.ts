import type { BaseMessage } from './base'

/**
 * 服务注册消息，用于插件或服务向 MCP 服务端注册自身能力
 */
export interface RegisterServiceMessage extends BaseMessage {
  /** 消息类型，固定为 'system' 表示系统消息 */
  type: 'system'

  /** 系统动作类型，表示这是注册服务的动作 */
  action: 'register'

  /**
   * 服务唯一标识 ID
   * 例如插件 ID 或服务名，用于区分不同服务
   */
  serviceId: string

  /**
   * 服务暴露的方法名列表
   * 表示该服务支持的远程调用接口名称
   */
  methods: string[]

  /**
   * 可选元数据，额外信息
   * 例如版本号、描述、支持的协议版本等，便于扩展
   */
  metadata?: Record<string, any>
}

/**
 * 请求获取当前所有注册服务列表的消息
 */
export interface ServiceListRequest extends BaseMessage {
  /** 消息类型，固定为 'system' */
  type: 'system'

  /** 系统动作类型，表示请求获取服务列表 */
  action: 'getServices'
}

/**
 * 响应服务列表请求，返回所有已注册的服务信息
 */
export interface ServiceListResponse extends BaseMessage {
  /** 消息类型，固定为 'system' */
  type: 'system'

  /** 系统动作类型，表示返回服务列表 */
  action: 'serviceList'

  /**
   * 服务信息列表，每个元素包含服务 ID、支持的方法及可选元数据
   */
  services: {
    /** 服务唯一标识 ID */
    serviceId: string

    /** 该服务支持的远程调用方法名数组 */
    methods: string[]

    /** 可选的服务元数据 */
    metadata?: Record<string, any>
  }[]
}

export interface ServiceRegistrationResponse extends BaseMessage {
  /** 消息类型，固定为 'system' */
  type: 'system'

  /** 系统动作类型，表示服务注册响应 */
  action: 'registerResponse'

  /** 是否注册成功 */
  success: boolean

  /** 注册的服务 ID */
  serviceId: string

  /** 可选的错误信息，如果注册失败 */
  error?: string
}