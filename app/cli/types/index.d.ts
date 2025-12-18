export type Channel = {
  /**
   * 频道名称
   */
  name: string
  /**
   * 频道logo
   */
  logo: string
  /**
   * 频道别名（正则）
   */
  alias?: string
}
export type ChannelGroup = {
  /**
   * 分组名称
   */
  name: string
  channels?: Array<Channel>
}

/**
 * 不同维度的分组
 */
export type Group = {
  group_name: string
  group_data: Array<ChannelGroup>
}
