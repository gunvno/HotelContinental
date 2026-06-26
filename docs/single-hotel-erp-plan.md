# Single Hotel ERP Direction

Hotel Continental is now treated as one hotel with a customer-facing booking site and an internal ERP-style admin portal.

## Scope

- Keep the customer website for room booking, full initial room payment, invoice viewing, cancellation requests, stay date changes, and optional extra service ordering.
- Use the admin portal as the operational ERP for staff.
- Do not introduce multi-hotel switching or hotel selection flows.
- Buildings, floors, rooms, room types, services, bookings, invoices, payments, staff, and reports all belong to the single hotel.

## Roles

- `ADMIN`: full system control.
- `MANAGER`: operational management, reports, booking/service/payment oversight.
- `RECEPTIONIST`: booking operations, check-in/check-out, add services, collect checkout payments.
- `CUSTOMER_SUPPORT`: customer chat and support workflows.
- `HOUSEKEEPING`: room/service execution, view assigned operational records, mark service orders as served, check-in/check-out work shift.
- `CUSTOMER`: customer-facing web account.

## Service Order Operations

Extra services are managed as ERP tasks:

- Customer can request or pay for allowed services from the customer site.
- Receptionist/manager can add services for a booking from admin.
- Housekeeping can view pending service orders and mark them as served.
- Managers/receptionists can approve or reject services that require staff approval.
- Service order filters should support at least serving status, source, approval status, and payment status.

## Staff Activity

Identity service owns staff activity history:

- login time
- logout time
- work check-in time
- work check-out time
- active/completed session status

This data is the base for later payroll, shift, and employee performance reporting.

## Payment Rule

- Initial room booking stays full-payment first.
- Extra services after check-in can be paid immediately by PayOS or posted to checkout.
- Checkout collects only unpaid service orders and additional charges.
