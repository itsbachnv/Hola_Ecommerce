namespace Ecommer.Enums;

public enum VoucherType { Percent = 1, Amount = 2 }
public enum OrderStatus { Draft, PendingPayment, Paid, AwaitingFulfillment, Shipped, Delivered, Cancelled, Refunded }
public enum PaymentStatus { Pending, Authorized, Paid, Failed, Refunded }
public enum ShipmentStatus { Pending, Shipped, Delivered, Failed, Returned }
public enum InventoryTxnType { Inbound, Outbound, Reserve, Release, Adjust }
public enum ChatRole { User, Assistant, System }