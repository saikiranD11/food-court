export class VendorWebSocket {
  ws: WebSocket | null = null;
  vendorId: number;
  onOrderUpdate: (order: any) => void = () => {};
  
  constructor(vendorId: number) {
    this.vendorId = vendorId;
  }
  
  connect() {
    const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE?.replace(/^http/, 'ws')}/vendor/${this.vendorId}/ws`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_update') {
        this.onOrderUpdate(data.order);
      }
    };
  }
  
  disconnect() {
    this.ws?.close();
  }
}