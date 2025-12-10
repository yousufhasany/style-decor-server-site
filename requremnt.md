B12-A10_category-07

📽 Video Explanation B12 A11 Home Decoration Service Requirement Explanation.mp4

🚩We Will Notify Requirement update here if we made any 




Project: Smart Home & Ceremony Decoration Booking System


Dear Candidates,
We are pleased to inform you that you have successfully passed the first round of the selection process! 🎉
Your application and skills have impressed our team, and we are excited to move forward to the next stage of evaluation. This project has been specifically designed to test your technical ability, creativity, problem-solving skills, and real-world project planning skills.
Please read the requirements carefully and follow each instruction to achieve full marks.



📝 Project Overview and Discussion
📌 What is StyleDecor?
StyleDecor is a modern appointment management system for a local decoration company that offers both in-studio consultations and on-site decoration services for homes and ceremonies. Users can explore decoration packages, check decorator availability, select a date & time, choose a service mode, make payments, and track their service status.
📌 Why develop this system?
Local decoration businesses often face major issues:
Walk-in crowd & long waiting times for consultations
No online booking system for decoration services
Difficulty managing multiple decorators and their specialties
No system for on-site service assignment and coordination

StyleDecor solves these problems by providing:
Smart appointment scheduling for consultations and services
Decorator availability and specialty management
On-site service coordination workflow
Real-time project status updates
Integrated payments for packages and services
Powerful dashboard & analytics for business insights
📌 How the system works
User Flow
User browses decoration packages and services
Selects preferred date & time slot
Checks the decorator's availability and expertise
Makes payment for selected package
For on-site service → Admin assigns decorator team
Decorator updates project status
User receives final confirmation
On-Site Service Status Flow
Assigned
Planning Phase
Materials Prepared
On the Way to Venue
Setup in Progress
Completed



📌 Similar Website Inspiration
Urban Company (Home services)
The Knot (Wedding planning)
Thumbtack (Local services)
TaskRabbit (Home services)
Local decoration company websites



🧩 Ensure the Following Things to Get 100% Marks 
✔ Meaningful Git Commits
Client: Minimum 20 commits
Server: Minimum 12 commits
✔ README File Must Include
Project name
Purpose
Live URL
Key features
All NPM packages used
✔ Secure Your Environment
Firebase keys in .env
MongoDB credentials in .env
✔ UI & UX Requirements
Beautiful accent colors
Consistent spacing, alignment
Clear visual hierarchy
Modern DaisyUI-based UI
Avoid any "gobindo" cluttered design
🚫 Strict Restriction
If your project is similar to any previous module/conceptual/assignment → 0 marks and risk of losing rewards.



🚀 Deployment Guidelines 
You will receive 0 marks if the live site or server does not work properly.
Important:
No CORS / 404 / 504 errors
Live link must load without reload errors
All private routes must stay logged in during reload
Firebase redirect URL added in Authorized domains
Proper environment variables must be used



🧱 Layout & Page Structure 
Navbar Requirements
Logo & brand name
Navigation menu: Home, Services, About, Contact
Dashboard button (if logged in)
Login/Profile dropdown
Footer Requirements
Contact details
Social media links
Business working hours
Copyright
Main Pages
Home Page
Services Page
Booking Page for Consultations & Services [Service Details Page]
Payment Page
Service Coverage Map Page
Login/Register Page
Error Page
Loading Spinner / Skeletons in pages



🔐 Authentication System
Register
User registers via email/password
Upload profile image using ImageBB or Cloudinary
Role will be assigned by admin (for decorators)
Login
Email/password login
Social login allowed
JWT token must be used
Role-Based Routing
Admin Routes (manage decorators, services, appointments)
Decorator Routes (view assigned projects, update status)
User Routes (booking history)

🌎 Open Routes
Services Page
In this page, all the decoration services will appear here in Card Grid format.
Services 
can be searched based on service name, 
can be filtered based on 
service type, 
budget range (min ~ max)

Service Details Page
In this page, all the information of a particular decoration service will be shown. 
This is an open route / page. But from this page, only logged-in users can book a service.
There would be a “Book Now” button, clicking this button may pop-up a modal or show a form to create booking. The form will already be filled by the logged-in user’s email and display name, and necessary information of the decoration service the user is trying to book. Take booking date, and location as user input in this form and after form submission, this will be stored in the booking collection in the database.

🏠 Home Page Requirements 
Must Include:
Dynamic Services Section
Loaded from server
Grid layout with decoration package images

Top Decorators Section
Dynamic
Ratings and specialties included

Animated Hero Section (Framer-Motion)


With a CTA button "Book Decoration Service"

Service Coverage Map Section


Use React Leaflet



📊 Dashboard Layout Requirements 
1. User Dashboard
My Profile
My Bookings
Booking Cancellation
Payment History
User Can:
Book consultation or decoration service from Service details page.
Update or Cancel booking
Pay for the services he/she booked.


2. Admin Dashboard
Manage Decorators (CRUD)
Manage Services & Packages (CRUD)
Manage Bookings
Can check whether user has paid for the booking or not
Assign Decorator for On-Site Services
If user has paid for the booking/service, admin will assign a decorator
Approve/Disable Decorator Accounts
Revenue Monitoring
Analytics Charts
Service Demand Chart
Number of services booked by users (histogram)


Admin Can:
Create/Update/Delete:
Decoration Service / Packages
	While creating a Decoration Service, the necessary fields are
service_name
cost (BDT)
unit [ for example: per sqrt-ft , per floor, per meter etc]
service category [ for example : home, wedding, office, seminar, meeting etc ]
description
createdByEmail [ auto filled or posted into database ]

Make a user Decorator
3. Decorator Dashboard
My Assigned Projects
Today's Schedule
Update Project Status
Earnings Summary
Decorator Can:
Update project status (step-by-step)
Checking payment history



💳 Payment System 
Use Stripe
Store transactions in the server
Payment receipt in the user dashboard







🧿 Additional Requirements 
Global Loading page
Global Error page
Spinners for all async operations
Toast success/error notifications
Mobile responsive layout



🔥 Challenge Requirements 
Search functionality


Search decorators/services with name filters
Sorting functionality


Sort bookings by date, status
Token verification


JWT verification in all protected routes
Pagination (1 page only)


For booking history or decorator list



📥 What to Submit 
Admin Email
Admin Password
Live Client URL
GitHub (Client)
GitHub (Server)



⭐ Optional Requirement 
SMS Notification (mock)
Offer/Coupon Code System
Multi-location business support
Subscription packages for regular clients
AI-based recommended decorator feature
Multiple decorators for large events
Service add-ons (Additional lighting, floral arrangements, theme enhancements, etc.)
