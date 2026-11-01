import asyncio
from backend.main import get_db, update_complaint_status, StatusUpdate, get_citizen_notifications

async def test_direct_flow():
    db = get_db()
    # Find any complaint in MongoDB
    complaint = await db.complaints.find_one({})
    if not complaint:
        print("No complaint found in database.")
        return
    
    cid = complaint["complaint_id"]
    print(f"Testing direct officer update for Complaint ID: {cid}")
    
    # Simulate Officer sending direct message & marking In Progress
    update_res = await update_complaint_status(
        cid,
        StatusUpdate(
            status="In Progress",
            remarks="Field team inspected site. Excavation and repair of pipeline started.",
            officer_name="Er. Rajesh Kumar",
            officer_department="Water Supply Department",
            officer_designation="Nodal Executive Officer"
        )
    )
    print("Status update result:", update_res["message"])
    
    # Check notifications created for citizen
    notif_res = await get_citizen_notifications(complaint_ids=cid)
    print("Notifications count for citizen:", len(notif_res["notifications"]))
    if notif_res["notifications"]:
        first = notif_res["notifications"][0]
        print(f"Latest Notification: {first.get('title')} | Sender: {first.get('officer_name')} | Message: {first.get('message')}")

asyncio.run(test_direct_flow())

