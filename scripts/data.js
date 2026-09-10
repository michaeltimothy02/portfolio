/*
 * Internship experience data.
 *
 * All descriptive text (Overview, project descriptions, Design Process,
 * Visual Language, User Roles, Database Design, etc.) lives directly in
 * pages/experience-detail.html so it can be edited without touching this
 * file. This file only holds the data that's genuinely dynamic/structural:
 *
 * Top-level internship fields:
 *   id        - unique number, used in the URL as experience-detail.html?id=<id>
 *   company   - company name
 *   logo      - path/URL to the company logo image
 *   role      - your job title during the internship
 *   startDate / endDate - internship period, shown as "startDate – endDate"
 *   projects  - array of project objects (see below), in the same order as
 *               the project sections written in pages/experience-detail.html
 *
 * Each project object supports:
 *   carousels - array of { sectionLabel, slides: [{ image, label, desc }] },
 *               each rendered as its own left-right swipeable image carousel
 *               (one entry for a single carousel, several for multiple
 *               labeled carousel sections)
 *   cta       - { label, url, icon } call-to-action button below the
 *               carousel(s) (icon is a Material Symbols icon name, e.g. "open_in_new")
 */

// Simple gray placeholder image — replace every carousel `image` value below with your own screenshot.
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23c4c6cd'/%3E%3C/svg%3E";

const internships = [
  {
    id: 1,
    company: "Pengadilan Tinggi Tata Usaha Negara Jakarta",
    logo: "../assets/images/pttunlogo.png",
    role: "Full Stack Developer",
    startDate: "July 2026",
    endDate: "August 2026",
    projects: [
      {
        // Sistem Perpustakaan
        carousels: [
          {
            sectionLabel: "Interface Screens",
            slides: [
              { image: "../assets/images/landingpage.png", label: "Landing Page", desc: "Displays the library services available, recently added books in the system, and general information about the library." },
              { image: "../assets/images/bookcatalog.png", label: "Book Catalog", desc: "A full catalog of the book collection with category, availability status, shelf location, and publication year filters." },
              { image: "../assets/images/bookdetail.png", label: "Book Detail", desc: "Book detail showing author, category, page count, and shelf location." },
              { image: "../assets/images/bookloanform.png", label: "Book Loan Form", desc: "Book loan form with fields for name, contact information, and loan duration ranging from 1 to 7 days." },
            ]
          }
        ],
        cta: { label: "View on Figma", url: "https://www.figma.com/design/dzdhSmOlLzOIkFGS0WWSZm/Project-Design-PT-TUN?node-id=583-2&t=roMk4hLhOJTMzvPa-1", icon: "open_in_new" }
      },
      {
        // SIAP SIDANG
        carousels: [
          {
            sectionLabel: "Guest View Interface",
            slides: [
              { image: "../assets/images/siapsidanglanding.png", label: "Landing Page", desc: "A public page that allows users to view hearing schedules and attendance status by case number." },
              { image: "../assets/images/jadwalsidangguest.png", label: "Hearing Schedules", desc: "Details of the hearing schedule, case parties, judges, and substitute court clerks." },
              { image: "../assets/images/hearingattendances.png", label: "Hearing Attendances", desc: "View the attendance status of the plaintiff and defendant for each hearing." }
            ]
          },
          {
            sectionLabel: "Admin Interface",
            slides: [
              { image: "../assets/images/buatnoperkara.png", label: "Create Case Number", desc: "Create a case number, agenda, and enter the plaintiff and defendant names." },
              { image: "../assets/images/buatjadwalsidang.png", label: "Create Hearing Schedule", desc: "Select a case number to auto fill case details, then add the judges, clerk, date, time, and courtroom." },
              { image: "../assets/images/buatnamahakimpp.png", label: "Judge and Clerk Records", desc: "Manage the names and records of judges and substitute court clerks." }
            ]
          }
        ],
        cta: { label: "Visit Website", url: "https://siapsidangpttun-production.up.railway.app", icon: "code" }
      }
    ]
  }
];
