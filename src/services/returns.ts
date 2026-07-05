const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ReturnRequestPayload {
  order_item_id: string
  reason: string
  qty_returned: number
}

export interface ReturnResponse {
  id: string
  status: string
  reason: string
  qty_returned: number
  refund_amount: number
  created_at: string
}

export const returnsService = {
  /**
   * Submit a single return request.
   * For multi-item returns, call this multiple times (once per item).
   */
  request: async (
    token: string,
    payload: ReturnRequestPayload
  ): Promise<ReturnResponse> => {
    const res = await fetch(`${API_URL}/customer/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.message || `Failed to request return (${res.status})`)
    }
    return json.data
  },

  /**
   * Submit multiple return requests at once (one API call per item, in parallel).
   * Returns aggregated results.
   */
  requestMultiple: async (
    token: string,
    items: ReturnRequestPayload[]
  ): Promise<{
    successful: ReturnResponse[]
    failed: { payload: ReturnRequestPayload; error: string }[]
  }> => {
    const results = await Promise.allSettled(
      items.map((payload) => returnsService.request(token, payload))
    )

    const successful: ReturnResponse[] = []
    const failed: { payload: ReturnRequestPayload; error: string }[] = []

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value)
      } else {
        failed.push({
          payload: items[idx],
          error: result.reason?.message || 'Unknown error',
        })
      }
    })

    return { successful, failed }
  },
}