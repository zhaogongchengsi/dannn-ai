/**
 * 通用基础消息接口，所有协议消息都应继承该接口
 */
export interface BaseMessage {
  /**
   * 全局唯一消息ID，建议使用 UUID v4
   * 用于消息追踪、去重、应答关联等场景
   */
  id: string

  /**
   * 消息类型，用于区分不同模块或协议
   * 目前定义为：
   * - 'rpc': 远程过程调用相关消息
   * - 'event': 事件通知消息
   * - 'chat': 聊天消息（如果有）
   * - 'system': 系统级消息，如服务注册、心跳等
   */
  type: 'rpc' | 'event' | 'chat' | 'system'

  /**
   * 协议版本号，方便未来协议升级兼容
   * 例如："1.0"、"2.1" 等
   */
  version?: string

  /**
   * 消息生成时间戳，单位毫秒，方便客户端/服务器做时序校验
   */
  timestamp: number
}
