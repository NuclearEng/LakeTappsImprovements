# Product Requirements Document (PRD)
# Lake Tapps Improvement Permit Workflow Application

**Version:** 1.0
**Date:** January 23, 2026
**Status:** Initial Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [Target Users](#4-target-users)
5. [Regulatory Landscape Overview](#5-regulatory-landscape-overview)
6. [Agency Requirements & Contact Directory](#6-agency-requirements--contact-directory)
7. [Workflow Stages](#7-workflow-stages)
8. [Data Collection Requirements](#8-data-collection-requirements)
9. [Insurance Requirements](#9-insurance-requirements)
10. [Permit Types & Thresholds](#10-permit-types--thresholds)
11. [Deadlines & Timeline Management](#11-deadlines--timeline-management)
12. [Output Requirements](#12-output-requirements)
13. [Technical Requirements](#13-technical-requirements)
14. [User Experience Requirements](#14-user-experience-requirements)
15. [Success Metrics](#15-success-metrics)
16. [Out of Scope](#16-out-of-scope)
17. [Appendices](#17-appendices)

---

## 1. Executive Summary

This document outlines the requirements for a comprehensive web-based workflow application designed to guide Lake Tapps property owners through the complex process of obtaining permits and licenses for modifications to existing structures or construction of new structures on Lake Tapps Reservoir. The application will streamline interactions with multiple regulatory agencies, ensure compliance with all requirements, and generate properly formatted documentation for submission.

Lake Tapps is a reservoir in Pierce County, Washington, owned by Cascade Water Alliance. Any improvements within the reservoir's shoreline (up to the 545' elevation line) require licenses from Cascade Water Alliance along with permits from various local, state, and federal agencies.

---

## 2. Problem Statement

Property owners on Lake Tapps face a fragmented and confusing permitting process that involves:

- **Multiple agencies** with overlapping jurisdictions (Cascade Water Alliance, City of Bonney Lake, Pierce County, WDFW, Army Corps of Engineers, Department of Ecology)
- **Complex insurance requirements** that must be maintained annually
- **Varying application forms** with different formats and submission methods
- **Strict deadlines** and timelines that are difficult to track
- **Technical requirements** for construction specifications that vary by improvement type
- **No single source of truth** for understanding the complete process

This complexity leads to:
- Delayed projects due to incomplete applications
- Costly mistakes from missing permits or insurance requirements
- Frustration and confusion for homeowners
- Potential legal issues from non-compliance

---

## 3. Goals & Objectives

### Primary Goals

1. **Simplify the Process**: Create a single, guided workflow that walks users through every step of the permitting process
2. **Ensure Compliance**: Guarantee all required permits, applications, and documentation are identified and completed
3. **Generate Documents**: Produce properly formatted PDF and DOCX files ready for submission
4. **Track Deadlines**: Provide clear visibility into all deadlines and renewal requirements
5. **Centralize Information**: Serve as a comprehensive resource for all Lake Tapps improvement requirements

### Success Criteria

- Users can complete the entire workflow without needing to research requirements independently
- Generated documents are accepted by all agencies without modification
- Zero compliance gaps in the workflow (all required permits identified)
- Application completion rate > 90%
- User satisfaction score > 4.5/5

---

## 4. Target Users

### Primary Users
- **Lake Tapps Property Owners**: Homeowners with property adjacent to Lake Tapps who want to build or modify structures
- **Property Managers**: Individuals managing Lake Tapps properties on behalf of owners

### Secondary Users
- **Contractors**: Licensed contractors performing work on Lake Tapps improvements
- **Real Estate Professionals**: Agents helping clients understand permit requirements

### User Characteristics
- Varying levels of technical knowledge
- May have no prior experience with permitting processes
- Need clear, jargon-free guidance
- Require mobile-friendly access for on-site reference

---

## 5. Regulatory Landscape Overview

### Jurisdiction Boundaries

**Cascade Water Alliance Ownership:**
- Reservoir lake bed and shoreline up to the **545' elevation line**
- Typical summer recreation level: 541.5' to 543'
- All structures within this boundary require CWA license

**City of Bonney Lake Shoreline Jurisdiction:**
- Generally within **200 feet of Lake Tapps**
- Subject to Shoreline Management Act regulations (Title 16, Article III BLMC)

### Improvements Requiring Permits

| Improvement Type | CWA License | City/County Permit | State Permits | Federal Permits |
|------------------|-------------|-------------------|---------------|-----------------|
| Bulkheads | Required | Required | HPA Required | Possible |
| Docks | Required | Required | HPA Required | Possible |
| Boat Lifts | Required | Required | HPA Required | Possible |
| Boat Ramps | Required | Required | HPA Required | Possible |
| Boat Houses | Required | Building Permit | HPA Required | Possible |
| Floats | Required | Required | HPA Required | Possible |
| Mooring Piles | Required | Required | HPA Required | Section 10 |

### Key Restrictions

- **Bulkhead Elevation**: Must be built to at least **544 feet elevation** (CWA can raise levels to 543')
- **Water Withdrawal**: Illegal to draw water for irrigation or other purposes
- **Dike Usage**: Closed to general public; trespassing enforced by Pierce County Sheriff
- **Boathouses**: Cannot include habitable space or plumbing

---

## 6. Agency Requirements & Contact Directory

### 6.1 Cascade Water Alliance (CWA)

**Role:** Primary licensor for all improvements on Lake Tapps Reservoir property

#### Primary Contact
| Field | Information |
|-------|-------------|
| **Contact Name** | **Paul Anderson** |
| **Email** | panderson@cascadewater.org |
| **Phone** | (425) 453-0930 |
| **Website** | https://cascadewater.org/lake-tapps/licenses-permits/ |

#### Submission Information
| Field | Information |
|-------|-------------|
| **Submission Method** | **Email** |
| **Submit To** | panderson@cascadewater.org |
| **Accepted Formats** | PDF attachments |

**Key Documents:**
- License Application Form
- Sample License Agreement
- Insurance Requirements Info Sheet
- Homeowner's Guide to Licensing Improvements
- Reservoir Property Management Policy (Table 1)

**Requirements:**
- License application must be approved BEFORE construction
- Annual insurance certificate submission required
- License fees (amount varies by improvement type)

---

### 6.2 City of Bonney Lake

**Role:** Local building, zoning, and shoreline permits

#### General Contact
| Field | Information |
|-------|-------------|
| **Department** | Permit Center |
| **Phone** | (253) 447-4356 |
| **Inspection Line** | (253) 447-4357 |
| **Fax** | (253) 862-1116 |
| **General Email** | permits@cobl.us |
| **Shoreline Questions Email** | planning@cobl.us |
| **Physical Address** | Public Services Center, 21719 96th St E, Buckley, WA 98321 |
| **Mailing Address** | City of Bonney Lake, Attn: Permit Center, 21719 96th St E, Buckley, WA 98321 |
| **Hours** | Monday-Thursday 9:00 AM - 4:00 PM, Fridays by Appointment Only |
| **Website** | https://www.ci.bonney-lake.wa.us/Government/Departments/Public_Services/Permit_Center |

#### Submission Information
| Field | Information |
|-------|-------------|
| **Submission Method** | **Electronic ONLY** (online portal required) |
| **Online Portal URL** | https://web.ci.bonney-lake.wa.us |
| **Portal Instructions** | Create account, select "Apply Now" |
| **Note** | All applications, documents, and plans MUST be submitted electronically |

**Permit Types:**
- Shoreline Exemption
- Shoreline Substantial Development Permit
- Shoreline Conditional Use Permit (SCUP)
- Shoreline Variance (SVAR)
- Building Permit (for boathouses)
- Miscellaneous Permit (Bulkheads, Docks, Vehicle Gates)

**Key Requirements:**
- All applications must be submitted **electronically**
- SCUP and SVAR require public hearing with Hearing Examiner
- SCUP and SVAR must be approved by WA Dept of Ecology
- Archaeological resource discovery requires immediate stop-work and notification

---

### 6.3 Pierce County Planning & Public Works

**Role:** Shoreline permits for unincorporated areas; backup jurisdiction

#### General Contact
| Field | Information |
|-------|-------------|
| **Department** | Development Center |
| **Phone** | (253) 798-3739 |
| **Email** | dlsdev@piercecountywa.gov |
| **Address** | 2401 S 35th St, Tacoma, WA 98409 (Annex East Entrance) |
| **Hours** | Monday-Friday 8:00 AM - 4:00 PM |
| **Website** | https://www.piercecountywa.gov/903/Development-Center |

#### Submission Information
| Field | Information |
|-------|-------------|
| **Submission Method** | **Online (PALS+)** or in-person |
| **Online Portal URL** | https://pals.piercecountywa.gov/palsonline/ |

#### Named Contacts

**PALS+ Technical Support:**
| Field | Information |
|-------|-------------|
| **Contact Name** | **Ray Clark** |
| **Title** | Business System Manager |
| **Email** | ray.clark@piercecountywa.gov |
| **Phone** | (253) 798-2735 |

**Cultural Resources (for archaeological concerns):**
| Field | Information |
|-------|-------------|
| **Contact Name** | **Adam Rorabaugh** |
| **Title** | Cultural Resources Archeologist |
| **Email** | Adam.rorabaugh@piercecountywa.gov |
| **Phone** | (253) 798-2749 |

---

### 6.4 Washington Department of Fish & Wildlife (WDFW)

**Role:** Hydraulic Project Approval (HPA) for work in or near water

#### General Contact
| Field | Information |
|-------|-------------|
| **Permit Type** | Hydraulic Project Approval (HPA) |
| **General Phone** | (360) 902-2534 |
| **Emergency HPA Hotline** | (360) 902-2537 (24-hour) |
| **TDD** | (360) 902-2207 |
| **Fax** | (360) 902-2946 |
| **Website** | https://wdfw.wa.gov/licenses/environmental/hpa |
| **Application Info Page** | https://wdfw.wa.gov/licenses/environmental/hpa/application |

#### Submission Information
| Field | Information |
|-------|-------------|
| **Primary Method (FASTEST)** | **Online via APPS** |
| **Online Portal URL** | https://hpa.wdfw.wa.gov/ |
| **Alternative Method** | Email or Mail (slower processing) |
| **Application Email** | HPAapplications@dfw.wa.gov |
| **Mailing Address** | Washington Department of Fish and Wildlife, P.O. Box 43234, Olympia, WA 98504-3234 |

**Timeline:** 45 days for standard review after complete application submitted

**Application Requirements:**
- Detailed project description (timing, location, scope)
- General plans and specifications
- Complete plans for work within ordinary high water line
- Fish protection specifications
- SEPA compliance documentation
- Authorization of agent form (if applicable)
- Consent of property owner form (if applicable)

**Exemptions:**
- Regular maintenance of existing structures (bridges, docks, levees) that doesn't expand or alter original structure

**Penalties for Non-Compliance:**
- Civil penalty up to **$10,000 per violation**
- Criminal prosecution: up to 364 days jail and/or $5,000 fine

---

### 6.5 U.S. Army Corps of Engineers - Seattle District

**Role:** Federal permits for work in navigable waters

#### General Contact
| Field | Information |
|-------|-------------|
| **District** | Seattle District, Regulatory Branch |
| **Phone** | (206) 764-3495 |
| **Fax** | (206) 764-6602 |
| **General Email** | paoteam@nws02.usace.army.mil |
| **Physical Address** | 4735 E. Marginal Way S., Bldg 1202, Seattle, WA 98134-2388 |
| **Mailing Address** | Seattle District Corps of Engineers, Regulatory Branch (CENWS-OD-RG), P.O. Box 3755, Seattle, WA 98124-3755 |
| **Website** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/ |
| **Contact Page** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Contact-Us/ |
| **Permit Guidebook** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Permit-Guidebook/ |

#### Submission Information
| Field | Information |
|-------|-------------|
| **Primary Method** | **Online via RRS** |
| **Online Portal URL** | https://rrs.usace.army.mil/rrs |
| **Apply for Permit Page** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Apply-For-A-Permit/ |
| **Alternative Method** | Mail to P.O. Box address above |

**Permit Types:**

| Permit | Requirement |
|--------|-------------|
| **Section 10** (Rivers & Harbors Act) | Work/structures in, over, or under navigable waters |
| **Section 404** (Clean Water Act) | Discharge of dredged or fill material into waters |
| **Nationwide Permits** | Pre-authorized for minimal environmental impact activities |

**Notes:**
- Determine if activity qualifies for Nationwide Permit or requires Individual Permit
- Some Nationwide Permits require Pre-Construction Notification (PCN)

---

### 6.6 Washington Department of Ecology

**Role:** 401 Water Quality Certification; Shoreline permit oversight

#### General Contact
| Field | Information |
|-------|-------------|
| **Unit** | Federal Permits Unit |
| **Phone** | (360) 407-6076 |
| **Email** | ecyrefedpermits@ecy.wa.gov |
| **Website** | https://ecology.wa.gov/regulations-permits/permits-certifications/401-water-quality-certification |
| **Relay Service/TTY** | 711 or (877) 833-6341 |

#### Submission Information
| Field | Information |
|-------|-------------|
| **Submission Method** | **Email ONLY** (mail NOT accepted) |
| **Submit To** | ecyrefedpermits@ecy.wa.gov |
| **Large Files (>25MB)** | Email to request secure upload link |
| **Required Info for Large Files** | Include Aquatics ID and project name |

**Requirements:**
- Pre-filing meeting requests submitted electronically
- All water quality certification requests via email
- Include Aquatics ID and project name when requesting upload link

---

### 6.7 City of Bonney Lake Cross Connection Control

**Role:** Ensures no cross-contamination between Lake Tapps water and municipal water supply

| Field | Information |
|-------|-------------|
| **Note** | Required for certain projects; contact City of Bonney Lake for details |

---

## 7. Workflow Stages

### 7.0 Workflow Design Principles

This application implements a **best-in-class workflow** designed around these core principles:

#### Core Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Progressive Disclosure** | Only show what's needed at each step; hide complexity until relevant |
| **Smart Defaults** | Pre-fill fields with intelligent defaults based on common scenarios |
| **Zero Redundancy** | Enter information once; auto-populate across all forms |
| **Real-Time Validation** | Catch errors immediately with helpful correction guidance |
| **Contextual Help** | Provide explanations exactly when and where needed |
| **Mobile-First** | Full functionality on any device |
| **Save & Resume** | Never lose progress; pick up exactly where you left off |
| **Accessibility** | WCAG 2.1 AA compliant; screen reader compatible |

#### Visual Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LAKE TAPPS PERMIT WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ STAGE 1  │───▶│ STAGE 2  │───▶│ STAGE 3  │───▶│ STAGE 4  │              │
│  │ Welcome  │    │ Project  │    │ Property │    │ Project  │              │
│  │ & Login  │    │  Type    │    │  Owner   │    │ Details  │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│       │               │               │               │                     │
│       │               ▼               │               ▼                     │
│       │     ┌─────────────────┐      │     ┌─────────────────┐            │
│       │     │ PERMIT DECISION │      │     │ SPECIFICATIONS  │            │
│       │     │     ENGINE      │      │     │  (Conditional)  │            │
│       │     └─────────────────┘      │     └─────────────────┘            │
│       │               │               │               │                     │
│       ▼               ▼               ▼               ▼                     │
│  ┌──────────────────────────────────────────────────────────┐              │
│  │              STAGE 5: SITE & DOCUMENTS                    │              │
│  └──────────────────────────────────────────────────────────┘              │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐              │
│  │         STAGE 6: PERMIT APPLICATIONS (Dynamic)            │              │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │              │
│  │  │   CWA   │ │  Local  │ │  State  │ │ Federal │        │              │
│  │  │ License │ │ Permits │ │ Permits │ │ Permits │        │              │
│  │  │(Always) │ │(If Req) │ │(If Req) │ │(If Req) │        │              │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │              │
│  └──────────────────────────────────────────────────────────┘              │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ STAGE 7  │───▶│ STAGE 8  │───▶│ STAGE 9  │───▶│ STAGE 10 │              │
│  │Insurance │    │ Review & │    │ Generate │    │ Submit & │              │
│  │   Info   │    │ Validate │    │   Docs   │    │  Track   │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Intelligent Workflow Engine Features

| Feature | Description |
|---------|-------------|
| **Permit Decision Engine** | Automatically determines required permits based on project type, cost, and scope |
| **Dynamic Stage Loading** | Only loads stages relevant to user's specific project |
| **Dependency Tracking** | Ensures prerequisites are met before advancing |
| **Parallel Path Support** | Some permits can be prepared simultaneously |
| **Estimated Timeline Calculator** | Provides realistic permit processing timeline |
| **Cost Estimator** | Estimates total permit fees based on selections |

---

### Stage 1: Welcome & Account Setup

**Purpose:** Create user account, explain process, set expectations

**Duration:** 2-3 minutes

#### 1a: Welcome Screen

**Display:**
- Brief explanation of the application's purpose
- Overview of typical permit process (visual timeline)
- Estimated time to complete workflow (based on project complexity)
- Privacy and data security assurance

**Smart Features:**
- [ ] "Quick Start" option for returning users
- [ ] "Learn More" expandable sections for first-time users
- [ ] Language selector (future: Spanish, Chinese, Vietnamese)

#### 1b: Account Creation / Login

| Field | Type | Required | Smart Features |
|-------|------|----------|----------------|
| Email Address | Email | Yes | Validates format; checks for typos (gmail.con → gmail.com) |
| Password | Password | Yes | Strength meter; breach database check |
| Phone Number | Phone | Yes | Auto-formats; sends verification code |
| Preferred Contact Method | Select | Yes | Email, Phone, or Both |

**System Actions:**
1. Send verification email/SMS
2. Create secure user profile
3. Initialize project workspace
4. Enable auto-save (every 30 seconds)

**Output:** Verified user account with secure session

---

### Stage 2: Project Type Selection (Permit Decision Engine)

**Purpose:** Intelligently determine all required permits with minimal user input

**Duration:** 3-5 minutes

#### 2a: Project Category Selection

**User Interface:** Large, visual cards with icons and descriptions

```
┌─────────────────────┐  ┌─────────────────────┐
│     🏗️ NEW          │  │     🔧 MODIFY       │
│   CONSTRUCTION      │  │   EXISTING          │
│                     │  │                     │
│ Building something  │  │ Changing, expanding │
│ that doesn't exist  │  │ or upgrading        │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│     🔨 REPAIR       │  │     🔄 REPLACE      │
│   MAINTENANCE       │  │   STRUCTURE         │
│                     │  │                     │
│ Fixing existing     │  │ Remove old, build   │
│ (may be exempt)     │  │ new in same place   │
└─────────────────────┘  └─────────────────────┘
```

#### 2b: Improvement Type Selection

**Dynamic Display:** Only show improvement types applicable to selected category

| Improvement Type | Icon | New | Modify | Repair | Replace |
|------------------|------|-----|--------|--------|---------|
| Dock/Pier | ⚓ | ✓ | ✓ | ✓ | ✓ |
| Bulkhead/Seawall | 🧱 | ✓ | ✓ | ✓ | ✓ |
| Boat Lift | 🏋️ | ✓ | ✓ | ✓ | ✓ |
| Boat Ramp | 📐 | ✓ | ✓ | ✓ | ✓ |
| Boat House | 🏠 | ✓ | ✓ | ✓ | ✓ |
| Float/Platform | 🛟 | ✓ | ✓ | ✓ | ✓ |
| Beach Area | 🏖️ | ✓ | ✓ | — | — |
| Lighting | 💡 | ✓ | ✓ | ✓ | — |
| Fire Pit | 🔥 | ✓ | — | — | — |
| Stairs/Path | 🪜 | ✓ | ✓ | ✓ | ✓ |

#### 2c: Quick Assessment Questions

**Conditional questions based on selections:**

| If Selected | Question | Purpose |
|-------------|----------|---------|
| Any improvement | "Is this on a dike?" | Dike restrictions apply |
| Repair/Maintenance | "Will you expand or alter the original structure?" | Determines HPA exemption |
| Boat Lift | "Will the lift use hydraulic oil?" | Must use non-oil-based tech |
| Bulkhead | "What elevation will the top be?" | Must be ≥ 544' |
| Any new | "Estimated total project cost?" | Determines permit thresholds |

#### 2d: Permit Decision Engine Results

**System automatically calculates and displays:**

```
┌─────────────────────────────────────────────────────────────────┐
│              📋 YOUR REQUIRED PERMITS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ REQUIRED                          ⏱️ Est. Processing Time   │
│  ─────────────────────────────────────────────────────────────  │
│  • CWA License                        2-4 weeks                 │
│  • City of Bonney Lake Shoreline      4-8 weeks                 │
│  • WDFW Hydraulic Project Approval    45 days                   │
│                                                                 │
│  ⚪ NOT REQUIRED (Based on your project)                        │
│  ─────────────────────────────────────────────────────────────  │
│  • Army Corps of Engineers            No fill material          │
│  • Dept of Ecology 401 Cert           No federal permit needed  │
│  • Building Permit                    Not a structure           │
│                                                                 │
│  💰 ESTIMATED TOTAL FEES: $350 - $500                           │
│  📅 ESTIMATED TOTAL TIMELINE: 8-12 weeks                        │
│                                                                 │
│  [View Detailed Breakdown]  [Why These Permits?]                │
└─────────────────────────────────────────────────────────────────┘
```

**Output:**
- Customized permit checklist
- Filtered workflow (only relevant stages)
- Timeline estimate
- Fee estimate

---

### Stage 3: Property Owner Information

**Purpose:** Collect owner details once; auto-populate all forms

**Duration:** 3-5 minutes

#### Smart Data Entry Features

| Feature | Implementation |
|---------|----------------|
| **Address Autocomplete** | Google Places API integration |
| **Parcel Lookup** | Auto-fetch from Pierce County Assessor by address |
| **Name Validation** | Warn if name differs from county records |
| **Duplicate Detection** | "We found an existing application for this property..." |

#### 3a: Primary Property Owner

| Field | Type | Required | Smart Features |
|-------|------|----------|----------------|
| Full Legal Name | Text | Yes | Match to deed; "First Last" format helper |
| Mailing Address | Address | Yes | Autocomplete; validates deliverability |
| Lake Tapps Property Address | Address | Yes | Validates against Lake Tapps parcels |
| Parcel Number | Text | Yes | Auto-lookup; format validation |
| Primary Phone | Phone | Yes | Auto-format; type selector (mobile/landline) |
| Secondary Phone | Phone | No | Optional backup |
| Email Address | Email | Yes | Pre-filled from account |
| Ownership Type | Select | Yes | Individual, Joint Tenancy, Trust, LLC, etc. |

#### 3b: Co-Owner Information (Conditional)

**Displayed if:** Ownership Type = Joint Tenancy, Community Property, or Partnership

| Field | Type | Required |
|-------|------|----------|
| Co-Owner Full Legal Name | Text | Yes |
| Co-Owner Phone | Phone | Yes |
| Co-Owner Email | Email | Yes |
| Relationship | Select | Yes (Spouse, Partner, Co-investor, Other) |

#### 3c: Entity Information (Conditional)

**Displayed if:** Ownership Type = LLC, Corporation, or Trust

| Field | Type | Required |
|-------|------|----------|
| Entity Legal Name | Text | Yes |
| Entity Type | Select | Yes |
| State of Formation | Select | Yes |
| UBI/EIN Number | Text | Yes |
| Registered Agent | Text | Yes |
| Authorized Signer Name | Text | Yes |
| Authorized Signer Title | Text | Yes |

**Output:** Complete owner profile; auto-populated for all subsequent forms

---

### Stage 4: Project Details & Specifications

**Purpose:** Collect project-specific information with intelligent guidance

**Duration:** 5-15 minutes (varies by project complexity)

#### 4a: General Project Information (ALL Projects)

| Field | Type | Required | Smart Features |
|-------|------|----------|----------------|
| Project Description | Text Area | Yes | Template suggestions; minimum 50 characters |
| Estimated Project Cost | Currency | Yes | Affects permit type; shows threshold warnings |
| Proposed Start Date | Date | Yes | Must be future; warns if < 12 weeks out |
| Proposed End Date | Date | Yes | Must be after start; calculates duration |
| Preferred Work Season | Multi-select | Yes | Summer, Fall, Winter, Spring |

**Intelligent Cost Threshold Warnings:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ PERMIT THRESHOLD ALERT                                      │
│                                                                 │
│  Your estimated cost of $25,000 is approaching the             │
│  Substantial Development Permit threshold of $28,000.           │
│                                                                 │
│  If your final cost exceeds $28,000, you will need a full      │
│  Shoreline Development Permit instead of an exemption.          │
│                                                                 │
│  [Keep Current Estimate]  [Adjust Estimate]  [Learn More]       │
└─────────────────────────────────────────────────────────────────┘
```

#### 4b: Dock/Pier Specifications (IF SELECTED)

| Field | Type | Required | Validation | Help Text |
|-------|------|----------|------------|-----------|
| Configuration | Visual Select | Yes | — | Straight, L-shape, T-shape, U-shape |
| Total Length | Number (ft) | Yes | Max varies by fetch | "Distance from shore to end" |
| Width | Number (ft) | Yes | Max 6' for first 30' | "Standard is 4-6 feet" |
| Decking Material | Select | Yes | No creosote | Composite, Untreated Wood, etc. |
| Number of Pilings | Number | Yes | — | "Count all support pilings" |
| Piling Material | Select | Yes | No creosote/penta | Steel, Concrete, Plastic |
| Piling Diameter | Number (in) | Yes | Max 6" for steel | "Outer diameter" |
| Water Depth at End | Number (ft) | Yes | Target 8' | "At normal summer level" |

**Visual Configuration Selector:**
```
Select your dock shape:

┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  ═══════   │  │  ═══════╗  │  │  ═══╦═══   │  │  ╔═══════╗ │
│  Straight  │  │  L-Shape │  │  T-Shape   │  │  U-Shape  │
│            │  │          │  │            │  │           │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
    ○              ○              ○              ○
```

**Auto-Calculations:**
- Surface Area = Length × Width (+ extensions for L/T/U)
- Intrusion Percentage = Length ÷ Fetch Distance × 100

#### 4c: Bulkhead/Seawall Specifications (IF SELECTED)

| Field | Type | Required | Validation | Help Text |
|-------|------|----------|------------|-----------|
| Total Length | Number (ft) | Yes | — | "Linear feet along shoreline" |
| Height | Number (ft) | Yes | — | "From base to top" |
| Top Elevation | Number (ft) | Yes | **Must be ≥ 544'** | "CWA requires minimum 544'" |
| Material | Select | Yes | — | Concrete, Steel Sheet Pile, etc. |
| Backfill Required | Yes/No | Yes | — | "Will you add soil behind?" |
| Backfill Volume | Number (cu yd) | Conditional | — | Only if backfill = Yes |

**Critical Elevation Warning:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 CRITICAL REQUIREMENT                                        │
│                                                                 │
│  Bulkhead top elevation must be at least 544 feet.              │
│                                                                 │
│  CWA can raise lake levels to 543 feet. Building below 544'    │
│  may result in flooding and will not be approved.               │
│                                                                 │
│  Your entered elevation: [    ] ft                              │
│                                                                 │
│  [Adjust Elevation]  [Contact CWA for Guidance]                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4d: Boat Lift Specifications (IF SELECTED)

| Field | Type | Required | Validation | Help Text |
|-------|------|----------|------------|-----------|
| Lift Type | Select | Yes | — | Floating, Pile-Mounted, Elevator |
| Power Source | Select | Yes | **Non-oil required** | Electric, Solar, Manual |
| Hydraulic System | Select | Yes | **Non-oil required** | Non-oil-based only |
| Weight Capacity | Number (lbs) | Yes | — | "Maximum boat weight" |
| Boat Length Capacity | Number (ft) | Yes | — | "Maximum boat length" |
| Installation Location | Select | Yes | — | On dock, Adjacent to dock, Standalone |

**Oil-Based Technology Warning:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ CWA REQUIREMENT                                             │
│                                                                 │
│  All new or modified boat lifts must use NON-OIL-BASED         │
│  technology to protect Lake Tapps water quality.                │
│                                                                 │
│  Approved systems: Electric, Solar, Vegetable-oil hydraulic     │
│  NOT approved: Petroleum-based hydraulic systems                │
│                                                                 │
│  [View Approved Lift Types]  [Find Compliant Contractors]       │
└─────────────────────────────────────────────────────────────────┘
```

#### 4e: Boat House Specifications (IF SELECTED)

| Field | Type | Required | Validation | Help Text |
|-------|------|----------|------------|-----------|
| Footprint Length | Number (ft) | Yes | — | "Length parallel to shore" |
| Footprint Width | Number (ft) | Yes | — | "Width perpendicular to shore" |
| Height | Number (ft) | Yes | — | "From water to peak" |
| Roof Type | Select | Yes | — | Flat, Gabled, Hip |
| **No Habitable Space** | Checkbox | Yes | **Must confirm** | "I confirm this will NOT contain living space" |
| **No Plumbing** | Checkbox | Yes | **Must confirm** | "I confirm this will NOT have plumbing" |

#### 4f: Other Improvement Specifications (IF SELECTED)

**Boat Ramp:**
| Field | Type | Required |
|-------|------|----------|
| Length | Number (ft) | Yes |
| Width | Number (ft) | Yes |
| Material | Select | Yes |
| Slope | Percentage | Yes |

**Beach Area:**
| Field | Type | Required |
|-------|------|----------|
| Length | Number (ft) | Yes |
| Width | Number (ft) | Yes |
| Sand/Gravel Volume | Number (cu yd) | Yes |

**Stairs/Path:**
| Field | Type | Required |
|-------|------|----------|
| Total Length | Number (ft) | Yes |
| Width | Number (ft) | Yes |
| Number of Steps | Number | Conditional |
| Material | Select | Yes |

**Output:** Complete project specifications with auto-calculations

---

### Stage 5: Site Information & Documents

**Purpose:** Collect site data and required drawings/photos

**Duration:** 10-20 minutes

#### 5a: Property Location Verification

**Interactive Map Interface:**
- Display property boundaries from Pierce County GIS
- Allow user to confirm/adjust property lines
- Mark location of proposed improvement
- Auto-calculate setbacks and distances

```
┌─────────────────────────────────────────────────────────────────┐
│  📍 CONFIRM YOUR PROPERTY & PROJECT LOCATION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Interactive Map showing:]                                     │
│  - Aerial/satellite view of property                           │
│  - Property boundary overlay                                    │
│  - 545' elevation line (CWA boundary)                          │
│  - Adjacent properties                                          │
│  - Draggable marker for improvement location                    │
│                                                                 │
│  Click and drag the marker to show where your                  │
│  improvement will be located.                                   │
│                                                                 │
│  [Satellite View]  [Topo View]  [Parcel View]                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5b: Site Measurements

| Field | Type | Required | Smart Features |
|-------|------|----------|----------------|
| Fetch Distance | Number (ft) | Yes | "Measure to opposite shore" - can measure on map |
| OHWL Elevation | Number (ft) | Yes | Default: 541.5' with explanation |
| Water Depth (at project site) | Number (ft) | Yes | At normal summer level |
| Distance to Property Line (Left) | Number (ft) | Yes | Setback verification |
| Distance to Property Line (Right) | Number (ft) | Yes | Setback verification |

#### 5c: Existing Conditions

| Field | Type | Required |
|-------|------|----------|
| Existing Structures Description | Text Area | Yes |
| Current Shoreline Condition | Select | Yes (Natural, Bulkhead, Riprap, Mixed) |
| Vegetation Present | Multi-select | Yes |
| Known Environmental Features | Multi-select | No (Wetlands, Fish habitat, etc.) |

#### 5d: Document Uploads

**Required Documents:**

| Document | Supported Formats | Requirements | Help |
|----------|-------------------|--------------|------|
| **Site Plan/Drawing** | See full list below | Must show: property lines, existing structures, proposed work, dimensions, setbacks | [View Example] [Drawing Guide] |
| **Current Site Photos** | All image formats | Min 3 photos: shoreline, project area, overview | [Photo Tips] |

**Recommended Documents:**

| Document | Supported Formats | When Helpful |
|----------|-------------------|--------------|
| Professional Survey | All formats | Complex projects, boundary disputes |
| Engineering Drawings | All formats | Bulkheads, large structures |
| Elevation Certificate | All formats | Projects near 544' threshold |

#### Supported File Types (Comprehensive)

**REQUIREMENT:** Accept ALL common file types users might have for site plans and documents.

##### Image Formats

| Format | Extension(s) | Notes |
|--------|--------------|-------|
| **JPEG** | .jpg, .jpeg | Most common photo format |
| **PNG** | .png | Good for screenshots, drawings |
| **GIF** | .gif | Supported (static images) |
| **WebP** | .webp | Modern web format |
| **TIFF** | .tif, .tiff | Professional/scanned documents |
| **BMP** | .bmp | Windows bitmap |
| **HEIC/HEIF** | .heic, .heif | iPhone photos (auto-convert to JPEG) |
| **SVG** | .svg | Vector graphics |
| **RAW** | .raw, .cr2, .nef, .arw | Camera raw (auto-convert) |

##### Document Formats

| Format | Extension(s) | Notes |
|--------|--------------|-------|
| **PDF** | .pdf | Preferred for multi-page documents |
| **Microsoft Word** | .doc, .docx | Auto-extract images if needed |
| **Microsoft Excel** | .xls, .xlsx | For data tables |
| **Microsoft PowerPoint** | .ppt, .pptx | Can contain site diagrams |
| **OpenDocument** | .odt, .ods, .odp | LibreOffice formats |
| **Rich Text** | .rtf | Universal text format |
| **Plain Text** | .txt | For notes/descriptions |

##### CAD & Design Formats

| Format | Extension(s) | Notes |
|--------|--------------|-------|
| **AutoCAD** | .dwg, .dxf | Professional drawings (render preview) |
| **SketchUp** | .skp | 3D models (render 2D preview) |
| **Visio** | .vsd, .vsdx | Diagrams |
| **Adobe Illustrator** | .ai | Vector graphics |
| **Adobe Photoshop** | .psd | Layered images (flatten for preview) |

##### Compressed Archives

| Format | Extension(s) | Notes |
|--------|--------------|-------|
| **ZIP** | .zip | Auto-extract and display contents |
| **RAR** | .rar | Auto-extract |
| **7-Zip** | .7z | Auto-extract |

##### File Size Limits

| Category | Maximum Size | Notes |
|----------|--------------|-------|
| Single file | 100 MB | Larger files auto-compressed |
| Total upload per project | 500 MB | Plenty for all documents |
| Individual images | 50 MB | Auto-resize if larger |

#### Upload Interface Features

```
┌─────────────────────────────────────────────────────────────────┐
│  📎 SITE PLAN UPLOAD                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │         📁 Drag & drop files here                       │   │
│  │                                                         │   │
│  │              or click to browse                         │   │
│  │                                                         │   │
│  │  Accepts: Images, PDFs, Word docs, CAD files, and more │   │
│  │  Maximum: 100 MB per file                               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  UPLOADED FILES:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📄 site-plan.pdf           2.4 MB    ✓    [Preview] [×]│   │
│  │  📷 shoreline-photo.heic    5.1 MB    ✓    [Preview] [×]│   │
│  │  📐 survey.dwg              1.8 MB    ✓    [Preview] [×]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [View Supported File Types]  [Having trouble? Get help]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Automatic File Processing

| File Type | Automatic Processing |
|-----------|---------------------|
| HEIC (iPhone) | Convert to JPEG for compatibility |
| Large images (>10MB) | Compress while maintaining quality |
| RAW camera files | Convert to high-quality JPEG |
| CAD files (.dwg, .dxf) | Generate 2D preview image |
| Multi-page PDFs | Generate thumbnail previews |
| Word/PowerPoint | Extract embedded images if relevant |
| Rotated photos | Auto-detect and correct orientation |
| ZIP archives | Extract and list contents for selection |

#### File Upload Error Messages

| Error | User-Friendly Message |
|-------|----------------------|
| File too large | "This file is [X] MB, which exceeds the 100 MB limit. Try compressing it or splitting into multiple files." |
| Unsupported format | "We don't recognize this file type ([extension]). Try saving it as PDF, JPG, or PNG." |
| Corrupt file | "This file appears to be damaged. Try re-saving or re-downloading it." |
| Upload interrupted | "Upload interrupted. Click 'Retry' to try again - your progress will resume." |
| Disk full | "Not enough space to save this file. Free up some disk space and try again." |

#### 5e: Environmental Screening (Conditional)

**Displayed if:** New construction, expansion, or ground disturbance

| Question | Type | Follow-up if Yes |
|----------|------|------------------|
| Are there wetlands on or near your property? | Yes/No | Upload wetland delineation |
| Will vegetation be removed? | Yes/No | Describe type and quantity |
| Will there be ground disturbance? | Yes/No | Describe erosion control plan |
| Are you aware of any fish spawning areas nearby? | Yes/No | Note in HPA application |

**Output:** Complete site documentation package

---

### Stage 6: Agent & Contractor Information (Conditional)

**Purpose:** Collect information about representatives and contractors

**Duration:** 3-5 minutes (if applicable)

**Display Trigger:** User indicates they will use an agent or contractor

#### 6a: Representation Question

```
┌─────────────────────────────────────────────────────────────────┐
│  Will anyone be acting on your behalf for this project?         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ○ No, I will handle all permit applications myself            │
│                                                                 │
│  ○ Yes, I have an authorized agent (architect, consultant)     │
│                                                                 │
│  ○ Yes, I have a contractor who will help with permits         │
│                                                                 │
│  ○ Yes, both an agent and a contractor                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 6b: Authorized Agent (IF APPLICABLE)

| Field | Type | Required |
|-------|------|----------|
| Agent Full Name | Text | Yes |
| Company Name | Text | No |
| Mailing Address | Address | Yes |
| Phone Number | Phone | Yes |
| Email Address | Email | Yes |
| Authorization Scope | Multi-select | Yes (Submit applications, Receive correspondence, Sign documents, All of the above) |
| **Upload: Signed Authorization Letter** | File | Yes |

**Authorization Letter Template:**
- System provides downloadable template
- Requires property owner signature
- Specifies scope of authorization

#### 6c: Contractor Information (IF APPLICABLE)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Contractor/Company Name | Text | Yes | — |
| WA Contractor License # | Text | Yes | Validate against L&I database |
| License Type | Display | Auto | Pulled from L&I |
| License Status | Display | Auto | Must be "Active" |
| Business Address | Address | Yes | — |
| Phone Number | Phone | Yes | — |
| Email Address | Email | Yes | — |
| **Upload: Contractor Insurance Certificate** | File | Yes | — |

**License Verification:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ CONTRACTOR LICENSE VERIFIED                                 │
│                                                                 │
│  ABC Marine Construction LLC                                    │
│  License #: ABCMAMC123AB                                        │
│  Status: ACTIVE                                                 │
│  Type: General Contractor                                       │
│  Expires: December 31, 2026                                     │
│                                                                 │
│  [View Full License Details]                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Output:** Agent/Contractor documentation; authorization letters

---

### Stage 7: Insurance Documentation

**Purpose:** Ensure CWA insurance requirements are met

**Duration:** 5-10 minutes

#### 7a: Insurance Requirement Explanation

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 INSURANCE REQUIREMENTS                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cascade Water Alliance requires all license holders to        │
│  maintain liability insurance that:                             │
│                                                                 │
│  ✓ Names "Cascade Water Alliance" as Additional Insured        │
│  ✓ Meets minimum coverage requirements                          │
│  ✓ Is updated ANNUALLY                                          │
│                                                                 │
│  Most standard homeowner's policies can be endorsed to          │
│  meet these requirements. Contact your insurance agent.         │
│                                                                 │
│  [Download CWA Insurance Requirements Sheet]                    │
│  [Sample Additional Insured Request Letter]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 7b: Insurance Information Entry

| Field | Type | Required | Smart Features |
|-------|------|----------|----------------|
| Insurance Company Name | Text + Autocomplete | Yes | Common insurers dropdown |
| Policy Number | Text | Yes | Format validation |
| Policy Type | Select | Yes | Homeowner's, Umbrella, Commercial |
| Agent Name | Text | Yes | — |
| Agent Phone | Phone | Yes | — |
| Agent Email | Email | Yes | — |
| Policy Effective Date | Date | Yes | — |
| Policy Expiration Date | Date | Yes | Warn if < 60 days |
| General Liability Limit | Currency | Yes | Validate against minimums |
| **CWA Named as Additional Insured?** | Yes/No | Yes | Must be Yes |
| **Upload: Certificate of Insurance** | File | Yes | PDF |

#### 7c: Insurance Validation

**System performs these checks:**

| Check | Pass | Fail Action |
|-------|------|-------------|
| Coverage meets minimum | ✅ | Show required amounts |
| CWA is Additional Insured | ✅ | Provide instructions to add |
| Policy not expired | ✅ | Show expiration warning |
| Certificate uploaded | ✅ | Require upload |

**If issues found:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ INSURANCE ACTION REQUIRED                                   │
│                                                                 │
│  Your certificate is missing the required Additional Insured    │
│  endorsement for Cascade Water Alliance.                        │
│                                                                 │
│  WHAT TO DO:                                                    │
│  1. Contact your insurance agent                                │
│  2. Request they add "Cascade Water Alliance" as Additional     │
│     Insured for your Lake Tapps property                        │
│  3. Request an updated Certificate of Insurance                 │
│  4. Upload the new certificate here                             │
│                                                                 │
│  [Download Request Letter Template]                             │
│  [Save & Continue Later]  [Upload New Certificate]              │
└─────────────────────────────────────────────────────────────────┘
```

#### 7d: Renewal Reminder Setup

**System automatically creates:**
- 60-day reminder before expiration
- 30-day reminder before expiration
- 7-day urgent reminder
- Expiration day alert

**Output:** Insurance compliance verification; renewal schedule

---

### Stage 8: Permit Applications (Dynamic)

**Purpose:** Complete all required permit applications

**Duration:** 15-30 minutes (varies by permits required)

**Critical Feature:** Only shows permits determined as required in Stage 2

#### 8a: CWA License Application (ALWAYS REQUIRED)

**Status Bar:**
```
┌─────────────────────────────────────────────────────────────────┐
│  CASCADE WATER ALLIANCE LICENSE APPLICATION                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  90% Complete  │
└─────────────────────────────────────────────────────────────────┘
```

**Pre-Populated Fields (from earlier stages):**
- Property owner name, address, phone, email ✓
- Property address, parcel number ✓
- Project description ✓
- Improvement specifications ✓
- Site plan ✓

**Additional Required Actions:**

| Action | Type |
|--------|------|
| Review all pre-populated information | Confirmation |
| Acknowledge license terms and conditions | Checkbox |
| Acknowledge liability release (flooding to 545') | Checkbox |
| Acknowledge indemnification requirement | Checkbox |
| Acknowledge annual insurance requirement | Checkbox |
| Digital signature | Signature pad |

**Output:**
- Complete CWA License Application (PDF)
- Submission: Email to **panderson@cascadewater.org**

---

#### 8b: Local Shoreline Permit (IF REQUIRED)

**Permit Type Auto-Determination:**

| Your Project | Estimated Cost | Permit Type |
|--------------|----------------|-------------|
| Replacement dock | < $20,000 | **Exempt** (letter only) |
| Replacement dock | $20,000 - $28,000 | **Exempt** (if equal/lesser size) |
| New dock | < $8,504 | **Exempt** |
| New dock | ≥ $8,504 | **SDP Required** |
| Bulkhead | Any | **SDP Required** |
| Boat house | Any | **SDP + Building Permit** |

**8b-1: Shoreline Exemption (IF EXEMPT)**

**Pre-Populated Fields:** All owner and project information

**Additional Fields:**
| Field | Type |
|-------|------|
| Exemption basis explanation | Pre-filled based on criteria |
| Confirmation of exemption criteria | Checkbox |

**Output:**
- Shoreline Exemption Request (PDF)
- Submission: Upload to **https://web.ci.bonney-lake.wa.us**

**8b-2: Substantial Development Permit (IF REQUIRED)**

**Additional Fields:**
| Field | Type | Required |
|-------|------|----------|
| SEPA Checklist responses | Form | Yes |
| Adjacent property owners list | Form | Yes |
| Detailed project narrative | Text Area | Yes |
| Environmental impact description | Text Area | Yes |

**8b-3: Conditional Use Permit / Variance (IF REQUIRED)**

**Additional notification:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ℹ️ PUBLIC HEARING REQUIRED                                     │
│                                                                 │
│  Your project requires a Shoreline Conditional Use Permit       │
│  which involves a public hearing before the Hearing Examiner.   │
│                                                                 │
│  This adds approximately 2-3 months to your timeline.           │
│                                                                 │
│  [Learn About the Hearing Process]                              │
└─────────────────────────────────────────────────────────────────┘
```

**Output:**
- Complete Shoreline Permit Application (PDF)
- Submission: Upload to **https://web.ci.bonney-lake.wa.us**

---

#### 8c: Building Permit (IF REQUIRED)

**Displayed if:** Boat house or other structure requiring building permit

**Additional Fields:**
| Field | Type | Required |
|-------|------|----------|
| Construction drawings | File upload | Yes |
| Structural specifications | File upload | Yes |
| Foundation details | Form | Yes |
| Materials list | Form | Yes |

**Output:**
- Building Permit Application (PDF)
- Submission: Upload to **https://web.ci.bonney-lake.wa.us**

---

#### 8d: WDFW Hydraulic Project Approval (IF REQUIRED)

**Exemption Check:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ❓ HPA EXEMPTION CHECK                                         │
│                                                                 │
│  Regular maintenance of existing structures may be exempt.      │
│                                                                 │
│  Does your project meet ALL of these criteria?                  │
│  □ Repairing an existing structure (not new construction)      │
│  □ No expansion beyond original footprint                       │
│  □ No alteration of original design/configuration               │
│  □ Using same or similar materials                              │
│                                                                 │
│  [All boxes checked = EXEMPT]  [Any unchecked = HPA REQUIRED]  │
└─────────────────────────────────────────────────────────────────┘
```

**IF HPA REQUIRED:**

**Pre-Populated Fields:** Project details, location, owner info

**Additional Required Fields:**
| Field | Type | Required |
|-------|------|----------|
| Fish species in project area | Multi-select | Yes |
| Work timing (avoid spawning seasons) | Date range | Yes |
| Fish protection measures | Text Area | Yes |
| Construction sequence | File upload | Yes |
| Erosion/sediment control plan | Text Area | Yes |

**Work Window Guidance:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📅 RECOMMENDED WORK WINDOWS FOR LAKE TAPPS                     │
│                                                                 │
│  Best time for in-water work: July 16 - February 15             │
│                                                                 │
│  Avoid: Spawning seasons for resident fish species              │
│                                                                 │
│  Your proposed dates: [Aug 1 - Sep 15] ✅ Within work window    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Output:**
- HPA Application (PDF) ready for APPS entry
- Submission: **https://hpa.wdfw.wa.gov/** (online - fastest)
- Alternative: Email to **HPAapplications@dfw.wa.gov**

---

#### 8e: Army Corps of Engineers (IF REQUIRED)

**Displayed if:** Federal permit triggered (rare for typical Lake Tapps projects)

**Determination:**
| Trigger | Permit Type |
|---------|-------------|
| Work in navigable waters | Section 10 |
| Discharge of fill material | Section 404 |
| Minimal impact | Nationwide Permit (NWP) |

**Nationwide Permit Eligibility:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 NATIONWIDE PERMIT ELIGIBILITY CHECK                         │
│                                                                 │
│  Based on your project, you may qualify for:                    │
│  NWP 13 - Bank Stabilization                                    │
│                                                                 │
│  This is a pre-authorized permit for projects with              │
│  minimal environmental impact.                                   │
│                                                                 │
│  [Check Eligibility Criteria]                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Output:**
- Army Corps Application (PDF)
- Submission: **https://rrs.usace.army.mil/rrs** (online)
- Alternative: Mail to **P.O. Box 3755, Seattle, WA 98124-3755**

---

#### 8f: Department of Ecology 401 Certification (IF REQUIRED)

**Displayed if:** Army Corps Section 404 permit required

**Output:**
- 401 Certification Request (PDF)
- Submission: Email ONLY to **ecyrefedpermits@ecy.wa.gov**

---

### Stage 9: Review & Validation

**Purpose:** Final review of all information; catch errors before submission

**Duration:** 5-10 minutes

#### 9a: Comprehensive Review Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ APPLICATION REVIEW                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROPERTY OWNER              [Edit]                             │
│  ─────────────────────────────────                              │
│  John Smith                                                     │
│  123 Lake Tapps Pkwy, Bonney Lake, WA 98391                    │
│  (253) 555-1234 | john.smith@email.com                          │
│  Parcel: 0123456789                                             │
│                                                                 │
│  PROJECT DETAILS             [Edit]                             │
│  ─────────────────────────────────                              │
│  Type: New Dock Construction                                    │
│  Dimensions: 40' × 6' (240 sq ft)                               │
│  Estimated Cost: $18,500                                        │
│  Timeline: August 2026 - September 2026                         │
│                                                                 │
│  REQUIRED PERMITS            [View Details]                     │
│  ─────────────────────────────────                              │
│  ✅ CWA License Application           Complete                  │
│  ✅ Shoreline Exemption               Complete                  │
│  ✅ WDFW HPA Application              Complete                  │
│  ⚪ Army Corps                         Not Required             │
│  ⚪ Building Permit                    Not Required             │
│                                                                 │
│  DOCUMENTS                   [View All]                         │
│  ─────────────────────────────────                              │
│  ✅ Site Plan                          Uploaded                 │
│  ✅ Site Photos (4)                    Uploaded                 │
│  ✅ Insurance Certificate              Uploaded & Verified      │
│                                                                 │
│  INSURANCE STATUS            [Update]                           │
│  ─────────────────────────────────                              │
│  ✅ Policy Active                      Expires: Dec 31, 2026    │
│  ✅ CWA Additional Insured             Verified                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 9b: Validation Checks

**System performs automated validation:**

| Check | Status | Action if Failed |
|-------|--------|------------------|
| All required fields complete | ✅/❌ | Highlight missing fields |
| Documents uploaded | ✅/❌ | List missing documents |
| Insurance verified | ✅/❌ | Show requirements |
| Specifications within limits | ✅/❌ | Show violations |
| Dates are valid | ✅/❌ | Correct dates |
| Signatures collected | ✅/❌ | Require signatures |

#### 9c: Pre-Flight Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│  🛫 PRE-SUBMISSION CHECKLIST                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Please confirm the following before generating documents:      │
│                                                                 │
│  ☑ I have reviewed all information and it is accurate          │
│  ☑ I understand I need approval BEFORE starting construction   │
│  ☑ I understand insurance must be maintained annually          │
│  ☑ I will submit applications to each agency as instructed     │
│  ☑ I understand processing times and have planned accordingly  │
│                                                                 │
│  [Go Back and Edit]              [Proceed to Generate Documents]│
└─────────────────────────────────────────────────────────────────┘
```

**Output:** Validation report; ready for document generation

---

### Stage 10: Document Generation & Download

**Purpose:** Generate all required documents in submission-ready format

**Duration:** 2-5 minutes

#### 10a: Document Generation

**Progress Display:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📄 GENERATING YOUR DOCUMENTS                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ CWA License Application              Generated              │
│  ✅ Shoreline Exemption Request          Generated              │
│  ✅ HPA Application                       Generated              │
│  ⏳ Project Summary Sheet                 Generating...          │
│  ○ Submission Checklist                  Pending                │
│  ○ Timeline Tracker                      Pending                │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  67%                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 10b: Document Package

**Your Complete Document Package:**

| Document | Format | Size | Preview | Download |
|----------|--------|------|---------|----------|
| **CWA License Application** | PDF | 245 KB | [Preview] | [PDF] [DOCX] |
| **Shoreline Exemption Request** | PDF | 189 KB | [Preview] | [PDF] [DOCX] |
| **HPA Application** | PDF | 312 KB | [Preview] | [PDF] [DOCX] |
| **Project Summary Sheet** | PDF | 156 KB | [Preview] | [PDF] [DOCX] |
| **Site Plan** | PDF | 1.2 MB | [Preview] | [PDF] |
| **Site Photos** | ZIP | 4.5 MB | — | [ZIP] |
| **Insurance Certificate** | PDF | 89 KB | [Preview] | [PDF] |
| **Submission Checklist** | PDF | 78 KB | [Preview] | [PDF] [DOCX] |
| **Timeline Tracker** | PDF | 92 KB | [Preview] | [PDF] [XLSX] |

**Download Options:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📥 DOWNLOAD OPTIONS                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Download All as ZIP]     Complete package (6.8 MB)            │
│                                                                 │
│  [Download by Agency]      Organized by submission destination  │
│     • CWA Package (License + Insurance + Site Plan)            │
│     • City Package (Exemption + Site Plan + Photos)            │
│     • WDFW Package (HPA + Site Plan + Photos)                  │
│                                                                 │
│  [Email Documents to Me]   Send download links to your email   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Output:** Complete document package ready for submission

---

### Stage 11: Submission Guide & Tracking

**Purpose:** Guide user through submission process; track progress

**Duration:** Ongoing (until all permits approved)

#### 11a: Personalized Submission Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│  📬 YOUR SUBMISSION CHECKLIST                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: CASCADE WATER ALLIANCE                  ○ Not Started │
│  ───────────────────────────────────────────────────────────── │
│  Submit: CWA License Application + Insurance Cert + Site Plan  │
│  Method: EMAIL                                                  │
│  To: panderson@cascadewater.org                                │
│  Contact: Paul Anderson | (425) 453-0930                       │
│                                                                 │
│  [Copy Email] [Open Email Client] [Mark as Submitted]          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  STEP 2: CITY OF BONNEY LAKE                     ○ Not Started │
│  ───────────────────────────────────────────────────────────── │
│  Submit: Shoreline Exemption + Site Plan + Photos              │
│  Method: ONLINE PORTAL                                          │
│  URL: https://web.ci.bonney-lake.wa.us                         │
│  Contact: permits@cobl.us | (253) 447-4356                     │
│                                                                 │
│  [Open Portal] [Mark as Submitted]                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  STEP 3: WDFW (HPA)                              ○ Not Started │
│  ───────────────────────────────────────────────────────────── │
│  Submit: HPA Application + Site Plan + Photos                  │
│  Method: ONLINE (APPS) - Fastest                               │
│  URL: https://hpa.wdfw.wa.gov/                                 │
│  Alternative: HPAapplications@dfw.wa.gov                       │
│  Contact: (360) 902-2534                                       │
│                                                                 │
│  [Open APPS Portal] [Copy Email] [Mark as Submitted]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 11b: Submission Tracking Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 PERMIT STATUS DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agency              Status          Submitted    Est. Decision │
│  ─────────────────────────────────────────────────────────────  │
│  CWA License         🟡 Submitted    Jan 23       Feb 6-20      │
│  City Shoreline      🟡 Submitted    Jan 23       Feb 20-Mar 6  │
│  WDFW HPA           🟢 Approved     Jan 23       ✅ Feb 28      │
│                                                                 │
│  Overall Progress: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  67%         │
│                                                                 │
│  NEXT ACTIONS:                                                  │
│  • Waiting for CWA decision (expected by Feb 20)               │
│  • Waiting for City decision (expected by Mar 6)               │
│                                                                 │
│  [Log a Status Update] [Upload Approval Letter] [Contact Help] │
└─────────────────────────────────────────────────────────────────┘
```

#### 11c: Status Logging

**User can log:**
| Status | Fields |
|--------|--------|
| Submitted | Date, confirmation number, contact name |
| Additional Info Requested | Date, what's needed, deadline |
| Approved | Date, approval number, conditions |
| Denied | Date, reason, appeal options |

#### 11d: Automated Reminders

**System sends reminders for:**

| Event | Timing | Method |
|-------|--------|--------|
| Submission reminder | 3 days after documents generated | Email |
| Status check-in | Every 2 weeks while pending | Email |
| Insurance renewal | 60, 30, 7 days before expiration | Email + SMS |
| Permit expiration | 90, 30, 7 days before | Email |
| Annual CWA renewal | 30 days before anniversary | Email |

#### 11e: Approval Celebration & Next Steps

**When all permits approved:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 CONGRATULATIONS!                                            │
│                                                                 │
│  All required permits have been approved!                       │
│                                                                 │
│  BEFORE YOU START CONSTRUCTION:                                 │
│  ─────────────────────────────────────────────────────────────  │
│  ☐ Call 8-1-1 at least 2 business days before digging          │
│  ☐ Post permits visibly at job site                            │
│  ☐ Notify CWA of construction start date                       │
│  ☐ Ensure contractor has copies of all approvals               │
│                                                                 │
│  ONGOING REQUIREMENTS:                                          │
│  ─────────────────────────────────────────────────────────────  │
│  • Maintain insurance and submit annual certificate to CWA     │
│  • Follow all permit conditions                                 │
│  • Schedule required inspections                                │
│  • Notify agencies of any changes to approved plans            │
│                                                                 │
│  [Download All Approvals] [Set Insurance Reminder] [Print]     │
└─────────────────────────────────────────────────────────────────┘
```

**Output:**
- Submission tracking dashboard
- Automated reminder system
- Approval documentation archive

---

## 8. Data Collection Requirements

### 8.1 Property Owner Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Legal Name | Text | Yes | As appears on property deed |
| Mailing Address | Address | Yes | Street, City, State, ZIP |
| Physical Property Address | Address | Yes | Lake Tapps property |
| Parcel Number | Text | Yes | Pierce County parcel ID |
| Phone Number (Primary) | Phone | Yes | Include area code |
| Phone Number (Secondary) | Phone | No | Backup contact |
| Email Address | Email | Yes | For correspondence |
| Property Ownership Type | Select | Yes | Individual, Trust, LLC, etc. |
| Co-Owner Information | Complex | Conditional | If jointly owned |

### 8.2 Authorized Agent Information (if applicable)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Agent Name | Text | Yes | Person authorized to act |
| Company Name | Text | No | If representing company |
| Agent Address | Address | Yes | Mailing address |
| Agent Phone | Phone | Yes | Contact number |
| Agent Email | Email | Yes | Email address |
| Authorization Document | File | Yes | Signed authorization |

### 8.3 Contractor Information (if applicable)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Contractor Name | Text | Yes | Licensed contractor |
| License Number | Text | Yes | WA contractor license |
| Company Name | Text | Yes | Business name |
| Address | Address | Yes | Business address |
| Phone Number | Phone | Yes | Business phone |
| Email Address | Email | Yes | Business email |
| Insurance Certificate | File | Yes | Contractor's insurance |

### 8.4 Project Details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Improvement Type(s) | Multi-select | Yes | Dock, Bulkhead, etc. |
| New or Modification | Select | Yes | New construction or modify existing |
| Project Description | Text Area | Yes | Detailed description |
| Estimated Project Cost | Currency | Yes | Fair market value |
| Proposed Start Date | Date | Yes | Construction start |
| Proposed End Date | Date | Yes | Expected completion |
| Work Timing | Multi-select | Yes | Seasons/months |
| Construction Methods | Text Area | Yes | How work will be done |

### 8.5 Structure Specifications

#### Dock/Pier Specifications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Length (ft) | Number | Yes | Total length into water |
| Width (ft) | Number | Yes | Width of structure |
| Shape | Select | Yes | Straight, L, T, U |
| Surface Area (sq ft) | Calculated | Yes | Auto-calculated |
| Decking Material | Select | Yes | Wood, composite, etc. |
| Structural Material | Select | Yes | Steel, concrete, etc. |
| Number of Pilings | Number | Yes | Total pilings |
| Piling Material | Select | Yes | Steel, concrete, etc. |
| Piling Diameter | Number | Yes | Diameter in inches |
| Water Depth at End | Number | Yes | Depth at terminus |

#### Bulkhead Specifications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Length (linear ft) | Number | Yes | Total length |
| Height (ft) | Number | Yes | Total height |
| Top Elevation (ft) | Number | Yes | Must be ≥ 544' |
| Material | Select | Yes | Concrete, steel, etc. |
| Backfill Required | Boolean | Yes | Yes/No |
| Backfill Volume (cu yd) | Number | Conditional | If backfill = Yes |

#### Boat Lift Specifications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Lift Type | Select | Yes | Floating, pile-mounted |
| Capacity (lbs) | Number | Yes | Weight capacity |
| Boat Length (ft) | Number | Yes | Max boat length |
| Location | Select | Yes | On dock, separate |

### 8.6 Site Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Site Plan | File | Yes | PDF or image |
| Survey | File | Recommended | Professional survey |
| Existing Structures | Text Area | Yes | Describe what exists |
| Adjacent Properties | Text Area | Yes | Neighbors/boundaries |
| Water Access Type | Select | Yes | Direct, shared, etc. |
| Fetch Distance | Number | Required | Distance to opposite shore |
| Ordinary High Water Line | Number | Yes | OHWL elevation |

### 8.7 Environmental Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Critical Areas Present | Multi-select | Yes | Wetlands, habitats, etc. |
| Fish Species Present | Multi-select | Yes | Known species |
| Vegetation to Remove | Text Area | Yes | Description |
| Erosion Control Plan | File | Conditional | If required |

### 8.8 Insurance Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Insurance Company Name | Text | Yes | Full legal name |
| Policy Number | Text | Yes | Current policy number |
| Agent Name | Text | Yes | Insurance agent |
| Agent Phone | Phone | Yes | Agent contact |
| Agent Email | Email | Yes | Agent email |
| Policy Effective Date | Date | Yes | Coverage start |
| Policy Expiration Date | Date | Yes | Coverage end |
| Liability Coverage Amount | Currency | Yes | Must meet minimums |
| Certificate of Insurance | File | Yes | Current certificate |

---

## 9. Insurance Requirements

### 9.1 Cascade Water Alliance Requirements

All license holders must maintain insurance coverage and provide annual proof of insurance to CWA.

**Required Coverage:**

| Coverage Type | Minimum Amount | Notes |
|---------------|----------------|-------|
| General Liability | TBD* | Per occurrence |
| Property Damage | TBD* | Per occurrence |
| Aggregate | TBD* | Annual aggregate |

*Note: Specific amounts are detailed in the CWA Insurance Requirements Info Sheet. Amounts may vary by improvement type.*

**Certificate Requirements:**
- Certificate of Insurance must be provided annually
- Cascade Water Alliance must be named as **Additional Insured**
- Certificate must show coverage effective dates
- Certificate must be from admitted carrier licensed in Washington

**Annual Renewal:**
- Insurance certificates must be renewed annually
- Submit updated certificate before expiration
- Failure to maintain insurance may result in license revocation

### 9.2 Contractor Insurance

Contractors performing work must maintain:

| Coverage Type | Minimum Amount |
|---------------|----------------|
| General Liability | $1,000,000 per occurrence |
| Workers Compensation | As required by WA State |
| Contractor Bond | As required by license |

---

## 10. Permit Types & Thresholds

### 10.1 Shoreline Substantial Development Permit Thresholds

**General Threshold:** $8,504 (activities exceeding this require SDP)

**Dock Exemption Thresholds (Fresh Water):**

| Scenario | Threshold | Requirements |
|----------|-----------|--------------|
| New Dock | $8,504 | Private, noncommercial, pleasure craft |
| Replacement Dock | $20,000 | Equal or lesser sq ft than existing |
| Replacement Dock (Updated SMP) | $28,000 | County with updated shoreline master program |

*Effective August 5, 2023*

### 10.2 Permit Type Decision Matrix

| Improvement | Estimated Cost | New/Modify | Permit Type Required |
|-------------|----------------|------------|---------------------|
| Dock | < $8,504 | New | Shoreline Exemption |
| Dock | $8,504 - $28,000 | Replacement | May be Exempt* |
| Dock | > $28,000 | Any | SDP Required |
| Bulkhead | Any | Any | Typically SDP Required |
| Boat House | Any | Any | SDP + Building Permit |
| Boat Lift | < $8,504 | Any | Shoreline Exemption |

*Subject to specific exemption criteria

### 10.3 Dimensional Standards (Pierce County)

**Dock/Pier Dimensions:**

| Dimension | Standard | Notes |
|-----------|----------|-------|
| Width (first 30') | 6 feet max | From MLLW/OHW |
| Max Intrusion | Lesser of 15% fetch OR max allowed | Project-specific |
| Water Depth Target | 8 feet | At terminus |

**Piling Requirements:**

| Requirement | Standard |
|-------------|----------|
| Max Diameter (Steel) | 6 inches |
| Bird Perching Devices | Required on all pilings |
| Prohibited Materials | Creosote, pentachlorophenol |
| Allowed Materials | Steel, concrete, recycled plastic, untreated/approved treated wood |
| Decking | Treated wood prohibited; use alternatives |

---

## 11. Deadlines & Timeline Management

### 11.1 Application Processing Times

| Agency | Permit Type | Processing Time |
|--------|-------------|-----------------|
| WDFW | HPA | 45 days (after complete application) |
| City of Bonney Lake | Shoreline Exemption | 2-4 weeks |
| City of Bonney Lake | SDP | 6-12 weeks |
| City of Bonney Lake | SCUP/SVAR | 3-6 months (includes hearing) |
| Pierce County | Similar to above | Varies |
| Army Corps | Nationwide Permit | 45-60 days |
| Army Corps | Individual Permit | 6-12 months |
| Dept of Ecology | 401 Certification | Concurrent with federal |

### 11.2 Recommended Timeline

**Recommended Start:** 6-12 months before construction

| Week | Activity |
|------|----------|
| 1-2 | Complete project assessment; gather property documents |
| 2-4 | Submit CWA License Application |
| 3-4 | Submit WDFW HPA Application (via APPS) |
| 4-6 | Submit local shoreline permit application |
| 4-8 | Submit Army Corps application (if required) |
| 8-16 | Receive permit decisions |
| 16+ | Begin construction (after ALL approvals) |

### 11.3 Annual Deadlines

| Item | Deadline | Notes |
|------|----------|-------|
| Insurance Certificate Renewal | Before expiration | Annual requirement |
| CWA License Fees | Per license terms | Annual payment |

### 11.4 Critical Reminders

The system will generate reminders for:

- **30 days before:** Insurance certificate expiration
- **60 days before:** Permit expiration (if applicable)
- **7 days before:** Any submission deadline
- **Immediately:** Upon document upload requirement

---

## 12. Output Requirements

### 12.1 Document Formats

The application must generate documents in:

| Format | Use Case |
|--------|----------|
| **PDF** | Official submissions, archives |
| **DOCX** | Editable drafts, custom modifications |

### 12.2 Generated Documents

#### Primary Applications

| Document | Format | Agency | Submission Method |
|----------|--------|--------|-------------------|
| CWA License Application | PDF | Cascade Water Alliance | Email |
| Shoreline Permit Application | PDF | City of Bonney Lake | Online Portal |
| Miscellaneous Permit Application | PDF | City of Bonney Lake | Online Portal |
| JARPA Form | PDF | Multiple agencies | Email/Online |
| HPA Application | PDF | WDFW | APPS Online |
| Army Corps Application | PDF | USACE | RRS Online/Mail |
| 401 Certification Request | PDF | Dept of Ecology | Email |

#### Supporting Documents

| Document | Format | Purpose |
|----------|--------|---------|
| Project Summary | PDF/DOCX | Overview for all agencies |
| Site Plan | PDF | Attachment for all applications |
| Insurance Certificate Summary | PDF | Quick reference |
| Submission Checklist | PDF/DOCX | Track all submissions |
| Agency Contact List | PDF/DOCX | All contacts in one place |
| Timeline/Gantt Chart | PDF | Project schedule |

### 12.3 Document Generation Requirements

Each generated document must include:

- Property owner name and contact information
- Property address and parcel number
- Date generated
- Unique document reference number
- Signature lines where required
- All required attachments listed

---

## 13. Technical Requirements

### 13.1 Project Repository & Distribution

| Field | Value |
|-------|-------|
| **GitHub Repository** | https://github.com/NuclearEng/LakeTappsImprovements.git |
| **License** | MIT License (Open Source) |
| **Primary Distribution** | GitHub Download / Clone |
| **Target Audience** | Lake Tapps property owners running locally |

### 13.2 Local-First Architecture

**CRITICAL REQUIREMENT:** The application must be easy to download and run locally with minimal technical expertise.

#### One-Click Local Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  🚀 QUICK START (For End Users)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Option 1: Download & Run (Recommended)                         │
│  ─────────────────────────────────────────────────────────────  │
│  1. Click "Download ZIP" on GitHub                              │
│  2. Extract to any folder                                       │
│  3. Double-click "start.bat" (Windows) or "start.sh" (Mac)     │
│  4. Open browser to http://localhost:3000                       │
│                                                                 │
│  Option 2: Clone & Run (For Developers)                         │
│  ─────────────────────────────────────────────────────────────  │
│  git clone https://github.com/NuclearEng/LakeTappsImprovements  │
│  cd LakeTappsImprovements                                       │
│  npm install && npm start                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Local Execution Requirements

| Requirement | Specification |
|-------------|---------------|
| **No Server Required** | Runs entirely on local machine |
| **No Account Required** | Works offline without registration |
| **No Internet Required** | Full functionality offline (except optional features) |
| **Data Stays Local** | All data stored on user's machine |
| **Zero Configuration** | Works out of the box |

#### Bundled Runtime (No Prerequisites)

The downloadable package includes everything needed:

| Component | Bundled | Notes |
|-----------|---------|-------|
| Node.js Runtime | ✅ Yes | Portable version included |
| All Dependencies | ✅ Yes | Pre-installed in package |
| Database | ✅ Yes | SQLite (local file) |
| PDF Generator | ✅ Yes | No external services |

### 13.3 Performance Requirements

**Target: Instant response on any modern computer**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Application Start** | < 5 seconds | Time from double-click to usable |
| **Page Navigation** | < 100ms | Between workflow stages |
| **Form Save** | < 50ms | Auto-save response time |
| **Document Generation** | < 10 seconds | Full PDF package |
| **Memory Usage** | < 512 MB | Total RAM consumption |
| **Disk Space** | < 500 MB | Installed size |
| **Offline Capability** | 100% | All core features work offline |

#### Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| Code Splitting | Load only what's needed per stage |
| Lazy Loading | Defer non-critical resources |
| Asset Compression | Minified JS/CSS, optimized images |
| Caching | Aggressive browser caching |
| Incremental Saves | Only save changed data |
| Background Processing | Generate documents without blocking UI |

### 13.4 Data Persistence & Storage

**CRITICAL:** User data must NEVER be lost.

#### Local Storage Architecture

```
LakeTappsImprovements/
├── data/
│   ├── projects/
│   │   ├── project-{uuid}.json      # Each project's data
│   │   └── ...
│   ├── documents/
│   │   ├── generated/               # Generated PDFs/DOCX
│   │   └── uploads/                 # User-uploaded files
│   ├── settings.json                # User preferences
│   └── backup/                      # Automatic backups
└── ...
```

#### Persistence Features

| Feature | Implementation |
|---------|----------------|
| **Auto-Save** | Every field change saved immediately |
| **Explicit Save Confirmation** | Visual confirmation on save |
| **Crash Recovery** | Recover data after unexpected close |
| **Version History** | Keep last 10 versions of each project |
| **Manual Backup** | Export entire project as single file |
| **Import/Restore** | Import from backup file |

#### Data Backup Schedule

| Backup Type | Frequency | Location |
|-------------|-----------|----------|
| Auto-save | Every field change | `data/projects/` |
| Incremental backup | Every 5 minutes | `data/backup/incremental/` |
| Full backup | On each stage completion | `data/backup/full/` |
| Session backup | On application close | `data/backup/session/` |

### 13.5 Technology Stack (Local-First)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js (Static Export) | Fast, no server needed |
| **Runtime** | Electron or Tauri | Desktop app wrapper |
| **Database** | SQLite + better-sqlite3 | Local, fast, reliable |
| **State Management** | Zustand + localStorage | Persistent state |
| **PDF Generation** | pdf-lib (client-side) | No server needed |
| **DOCX Generation** | docx.js | Client-side generation |
| **Styling** | Tailwind CSS | Small bundle, fast |
| **Forms** | React Hook Form | Performant forms |
| **Validation** | Zod | Type-safe validation |

### 13.6 Browser Support (Web Version)

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | Latest 2 versions | Primary target |
| Firefox | Latest 2 versions | Fully supported |
| Safari | Latest 2 versions | Fully supported |
| Edge | Latest 2 versions | Fully supported |
| Mobile Safari | iOS 14+ | Touch-optimized |
| Chrome Mobile | Android 10+ | Touch-optimized |

### 13.7 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Local Data Security** | Data encrypted at rest (AES-256) |
| **No Data Transmission** | Nothing sent to external servers |
| **No Tracking** | Zero analytics or telemetry |
| **PII Protection** | Sensitive fields encrypted in storage |
| **Secure Document Generation** | All processing local |

### 13.8 Accessibility

| Standard | Requirement |
|----------|-------------|
| WCAG | 2.1 Level AA compliance |
| Screen readers | Full compatibility (ARIA labels) |
| Keyboard navigation | Complete tab/enter support |
| Color contrast | Minimum 4.5:1 ratio |
| Font scaling | Responsive to system settings |
| Reduced motion | Respect prefers-reduced-motion |

---

## 14. User Experience Requirements

### 14.1 Core UX Principles

| Principle | Implementation |
|-----------|----------------|
| **Data Never Lost** | Auto-save every change; confirm before destructive actions |
| **Guided Workflow** | Clear prompts for every action; never leave user wondering |
| **Local & Private** | All data stays on user's machine |
| **Progressive Disclosure** | Show only what's relevant at each step |
| **Action Confirmation** | Prompt before major changes or submissions |
| **Clear Next Steps** | Always tell user exactly what to do next |
| **Easy Navigation** | Back button always available; jump to any completed step |

### 14.2 Navigation Requirements (Critical Feature)

**REQUIREMENT:** Users must ALWAYS be able to navigate backwards and forwards through the workflow.

#### Navigation Components

```
┌─────────────────────────────────────────────────────────────────┐
│  WORKFLOW NAVIGATION BAR (Always Visible)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐                                    ┌─────────────┐  │
│  │ ← Back │   Stage 3 of 11: Property Owner   │ Save & Exit │  │
│  └────────┘                                    └─────────────┘  │
│                                                                 │
│  Progress: ●───●───●───○───○───○───○───○───○───○───○           │
│            1   2   3   4   5   6   7   8   9  10  11           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Back Button Behavior

| Scenario | Back Button Action |
|----------|-------------------|
| **Normal navigation** | Return to previous stage; data preserved |
| **Unsaved changes** | Auto-save, then navigate (show toast: "Changes saved") |
| **Form validation errors** | Allow back navigation; errors remain for when user returns |
| **Document generation in progress** | Confirm cancellation before navigating |
| **First stage** | Back button disabled or returns to project list |

#### Navigation Button Layout (Every Stage)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Form content here...]                                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌──────────────┐                    ┌────────────────────────┐ │
│  │  ← Back      │                    │  Save & Continue ➜     │ │
│  └──────────────┘                    └────────────────────────┘ │
│                                                                 │
│        Secondary (gray)                    Primary (blue)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step Indicator Navigation

**Users can click any COMPLETED step to jump directly to it:**

```
┌─────────────────────────────────────────────────────────────────┐
│  CLICKABLE STEP INDICATOR                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ✓        ✓        ●        ○        ○        ○               │
│   ●────────●────────●────────○────────○────────○               │
│   1        2        3        4        5        6               │
│ Account  Project  Owner   Details   Site   Permits             │
│   ↑        ↑        ↑                                          │
│  Click   Click   Current                                       │
│  to go   to go   stage                                         │
│  back    back    (active)                                      │
│                                                                 │
│  ● Completed (clickable)                                        │
│  ● Current (highlighted)                                        │
│  ○ Not yet reached (not clickable)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Alt + ←` | Go to previous stage (same as Back button) |
| `Alt + →` | Go to next stage (if current stage is complete) |
| `Escape` | Close any open modal; focus returns to main content |
| `Tab` | Move between form fields |
| `Enter` | Submit current form / activate focused button |

#### Mobile Navigation

```
┌─────────────────────────────────┐
│  ← Back    Stage 3/11    ≡     │  ← Header with back button
├─────────────────────────────────┤
│                                 │
│  [Form content...]              │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  ┌───────────┐ ┌─────────────┐ │  ← Fixed bottom nav
│  │  ← Back   │ │ Continue ➜  │ │
│  └───────────┘ └─────────────┘ │
└─────────────────────────────────┘
```

#### Browser Back Button Support

| Browser Action | App Response |
|----------------|--------------|
| Browser back button | Navigate to previous workflow stage (not browser history) |
| Browser forward button | Navigate to next stage (if previously visited) |
| Browser refresh | Reload current stage; restore from auto-save |
| Close tab/window | Prompt "You have unsaved changes. Are you sure?" |

**Implementation:** Use browser History API to intercept back/forward and map to workflow navigation.

#### Navigation State Preservation

| Data | Preserved On Navigation? |
|------|-------------------------|
| All form field values | ✅ Yes - auto-saved |
| Uploaded files | ✅ Yes - stored locally |
| Validation state | ✅ Yes - errors persist |
| Scroll position | ✅ Yes - restored on return |
| Expanded/collapsed sections | ✅ Yes - UI state preserved |

### 14.3 Confirmation Prompts (Critical Feature)

**REQUIREMENT:** Before ANY major action, prompt user for confirmation.

#### Confirmation Prompt Types

| Action | Prompt Required | Reversible |
|--------|-----------------|------------|
| Delete project | ✅ Yes - with typed confirmation | No |
| Clear form section | ✅ Yes | Yes (via undo) |
| Generate documents | ✅ Yes - review first | N/A |
| Change project type | ✅ Yes - may lose data | Warn about data loss |
| Exit without saving | ✅ Yes | Yes |
| Submit to agency | ✅ Yes - checklist review | N/A |

#### Standard Confirmation Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ CONFIRM ACTION                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Are you sure you want to [action description]?                 │
│                                                                 │
│  [Specific warning or information about consequences]           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────────────────────┐              │
│  │   Cancel    │  │  Yes, [Confirm Action]      │              │
│  └─────────────┘  └─────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Destructive Action Confirmation (Type to Confirm)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 DELETE PROJECT                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  This will permanently delete:                                  │
│  • Project: "Smith Dock Construction"                           │
│  • All generated documents                                      │
│  • All uploaded files                                           │
│                                                                 │
│  This action CANNOT be undone.                                  │
│                                                                 │
│  Type "DELETE" to confirm:                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │                                                 │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────────────────────┐              │
│  │   Cancel    │  │  Delete Project (disabled)  │              │
│  └─────────────┘  └─────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 14.3 Action Prompts During Workflow (Critical Feature)

**REQUIREMENT:** When a form/document is ready, prompt user with specific actions before allowing them to continue.

#### Document Ready Action Prompt

When a permit application is completed, display an **Action Required** modal:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ CWA LICENSE APPLICATION COMPLETE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Cascade Water Alliance License Application is ready!      │
│                                                                 │
│  📥 DOWNLOAD YOUR DOCUMENT                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Download PDF]     [Download DOCX]     [Preview]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📧 SUBMISSION INSTRUCTIONS                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Submit this application via EMAIL to:                          │
│                                                                 │
│  To: panderson@cascadewater.org                                │
│  Contact: Paul Anderson                                         │
│  Phone: (425) 453-0930                                         │
│                                                                 │
│  Include with your email:                                       │
│  ☐ CWA License Application (this document)                     │
│  ☐ Certificate of Insurance                                     │
│  ☐ Site Plan                                                    │
│                                                                 │
│  [Copy Email Address]  [Open Email Client]                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ☐ I have downloaded the document                               │
│  ☐ I understand I need to email this to CWA                    │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │  Save & Come Back Later │  │  Continue to Next Permit ➜  │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
│  Note: "Continue" enabled after downloading and checking boxes  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Submission Method-Specific Prompts

**For EMAIL Submissions:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📧 SUBMIT VIA EMAIL                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Email your completed application to:                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  panderson@cascadewater.org                 [Copy]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Suggested Email Subject:                                       │
│  "CWA License Application - [Your Name] - [Parcel #]"          │
│                                                                 │
│  [Open Gmail]  [Open Outlook]  [Copy Subject Line]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**For ONLINE PORTAL Submissions:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🌐 SUBMIT VIA ONLINE PORTAL                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Submit your application through the City of Bonney Lake        │
│  online permit portal:                                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  https://web.ci.bonney-lake.wa.us              [Open]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STEPS TO SUBMIT:                                               │
│  1. Click "Open" to go to the portal                           │
│  2. Log in or create an account                                 │
│  3. Select "Apply for Permit"                                   │
│  4. Choose "Shoreline Exemption"                                │
│  5. Upload the documents you just downloaded                    │
│  6. Submit and save your confirmation number                    │
│                                                                 │
│  [Open Portal in New Tab]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**For MAIL Submissions:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📬 SUBMIT VIA MAIL                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Print and mail your application to:                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Seattle District Corps of Engineers                    │   │
│  │  Regulatory Branch (CENWS-OD-RG)                        │   │
│  │  P.O. Box 3755                                          │   │
│  │  Seattle, WA 98124-3755                     [Copy]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TIPS:                                                          │
│  • Use certified mail with return receipt for tracking         │
│  • Keep a copy of everything you mail                          │
│  • Include your phone number on all documents                  │
│                                                                 │
│  [Print Documents]  [Copy Address]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 14.4 Final Document Package Download

**At workflow completion, provide a comprehensive download option:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 ALL DOCUMENTS READY!                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your complete permit application package is ready.             │
│                                                                 │
│  📦 DOWNLOAD OPTIONS                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📥 DOWNLOAD EVERYTHING (Recommended)                   │   │
│  │                                                         │   │
│  │  One ZIP file with all documents organized by agency    │   │
│  │  Total size: 8.2 MB                                     │   │
│  │                                                         │   │
│  │  [Download Complete Package]                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📂 PACKAGE CONTENTS                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📁 1-CWA-License/                                              │
│     ├── CWA-License-Application.pdf                            │
│     ├── Insurance-Certificate.pdf                               │
│     └── Site-Plan.pdf                                           │
│                                                                 │
│  📁 2-City-Bonney-Lake/                                         │
│     ├── Shoreline-Exemption-Request.pdf                        │
│     ├── Site-Plan.pdf                                           │
│     └── Site-Photos.zip                                         │
│                                                                 │
│  📁 3-WDFW-HPA/                                                 │
│     ├── HPA-Application.pdf                                     │
│     ├── Construction-Sequence.pdf                               │
│     └── Site-Plan.pdf                                           │
│                                                                 │
│  📁 Reference/                                                  │
│     ├── Submission-Checklist.pdf                                │
│     ├── Agency-Contacts.pdf                                     │
│     ├── Timeline-Tracker.xlsx                                   │
│     └── Project-Summary.pdf                                     │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  💾 SAVE YOUR PROJECT                                           │
│  Your project data is automatically saved locally. You can:     │
│                                                                 │
│  [Export Project Backup]  (Save to USB drive, cloud, etc.)     │
│  [Print Submission Checklist]                                   │
│  [View Project Dashboard]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 14.5 Workflow Progress Persistence

| Feature | Description |
|---------|-------------|
| **Progress Bar** | Visual indicator showing completion percentage |
| **Stage Checklist** | Checkmarks for completed stages |
| **Resume Prompt** | On return, ask "Continue where you left off?" |
| **Draft List** | View all saved projects/drafts |
| **Last Modified** | Show when each project was last edited |

### 14.6 Help System

| Feature | Description |
|---------|-------------|
| **Field Tooltips** | Hover/tap for field explanations |
| **Example Values** | Show example inputs for complex fields |
| **Inline Help** | Expandable help text within forms |
| **FAQ Integration** | Context-sensitive FAQ links |
| **Glossary** | Define technical terms (OHWL, HPA, etc.) |
| **Video Tutorials** | Optional short instructional videos |

### 14.7 Notifications & Reminders

| Notification Type | Trigger | Display |
|-------------------|---------|---------|
| Auto-Save Confirmation | After each save | Brief toast notification |
| Document Ready | When generated | Modal with action prompt |
| Validation Error | On form issues | Inline + summary |
| Insurance Expiring | 60/30/7 days before | Modal on app open |
| Deadline Approaching | Before deadlines | Modal on app open |

### 14.8 Error Handling & Problem Notifications (Best-in-Class)

**CRITICAL:** When something goes wrong, users must immediately understand:
1. What happened
2. Why it happened
3. How to fix it

#### Error Notification Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Clear Language** | No technical jargon; plain English explanations |
| **Specific Guidance** | Tell user exactly what to do to fix it |
| **Non-Blocking** | Don't prevent user from accessing other features |
| **Persistent Until Resolved** | Don't auto-dismiss important errors |
| **Contextual** | Show errors near the relevant content |
| **Recoverable** | Always provide a path forward |

#### Error Types & Display Patterns

##### 1. Field-Level Validation Errors

**Display:** Inline, immediately below the field

```
┌─────────────────────────────────────────────────────────────────┐
│  Email Address *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ john.smith@                                      ⚠️     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ❌ Please enter a complete email address (e.g., name@email.com)│
│                                                                 │
│  Bulkhead Top Elevation *                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 542                                              ⚠️     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ❌ Elevation must be at least 544 feet. CWA requires bulkheads │
│     to be built above the maximum lake level of 543 feet.       │
│     [Learn more about elevation requirements]                   │
└─────────────────────────────────────────────────────────────────┘
```

##### 2. Form-Level Validation Summary

**Display:** At top of form when user tries to proceed

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ PLEASE FIX THE FOLLOWING ISSUES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  3 issues found on this page:                                   │
│                                                                 │
│  1. Email Address - Please enter a valid email                  │
│     [Jump to field]                                             │
│                                                                 │
│  2. Bulkhead Elevation - Must be at least 544 feet              │
│     [Jump to field]                                             │
│                                                                 │
│  3. Site Plan - Required document not uploaded                  │
│     [Jump to upload]                                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Fix Issues and Continue                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### 3. Document Generation Errors

**Display:** Modal with specific troubleshooting steps

```
┌─────────────────────────────────────────────────────────────────┐
│  ❌ DOCUMENT GENERATION FAILED                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  We couldn't generate your CWA License Application.             │
│                                                                 │
│  WHAT WENT WRONG:                                               │
│  The site plan image file appears to be corrupted or            │
│  in an unsupported format.                                      │
│                                                                 │
│  HOW TO FIX IT:                                                 │
│  1. Go back to the Site Information section                     │
│  2. Remove the current site plan file                           │
│  3. Upload a new copy (supported: PDF, JPG, PNG)               │
│  4. Try generating the document again                           │
│                                                                 │
│  NEED HELP?                                                     │
│  • Make sure your file is under 25MB                           │
│  • Try converting to PDF format                                 │
│  • [View supported file formats]                                │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Close           │  │ Go to Site Information ➜            │  │
│  └─────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
│  Error Code: DOC-GEN-FILE-001 (for support reference)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### 4. File Upload Errors

**Display:** Inline with specific problem

```
┌─────────────────────────────────────────────────────────────────┐
│  📎 Site Plan *                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ❌ Upload Failed                                       │   │
│  │                                                         │   │
│  │  File: site-plan.tiff                                   │   │
│  │  Problem: TIFF format is not supported                  │   │
│  │                                                         │   │
│  │  Supported formats: PDF, JPG, PNG                       │   │
│  │  Maximum file size: 25 MB                               │   │
│  │                                                         │   │
│  │  💡 TIP: Most programs can "Save As" or "Export" to    │   │
│  │     PDF format.                                         │   │
│  │                                                         │   │
│  │  [Try Another File]                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### 5. Data Save/Load Errors

**Display:** Toast notification (non-blocking) with retry option

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ⚠️ Auto-save temporarily unavailable                     │ │
│  │                                                           │ │
│  │  Your changes are stored in memory but couldn't be        │ │
│  │  saved to disk. This might happen if:                     │ │
│  │  • The data folder is on a disconnected drive            │ │
│  │  • Your disk is full                                      │ │
│  │                                                           │ │
│  │  Don't worry - your data is safe in memory.               │ │
│  │                                                           │ │
│  │  [Retry Save]  [Save to Different Location]  [Dismiss]   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### 6. Critical System Errors

**Display:** Full-screen modal with recovery options

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │               🔴 Something Went Wrong                     │ │
│  │                                                           │ │
│  │  The application encountered an unexpected error.         │ │
│  │                                                           │ │
│  │  GOOD NEWS:                                               │ │
│  │  ✓ Your data was automatically saved before the error    │ │
│  │  ✓ You can reload and continue where you left off        │ │
│  │                                                           │ │
│  │  WHAT YOU CAN DO:                                         │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  🔄 Reload Application (Recommended)                │ │ │
│  │  │     Your data will be restored automatically         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  📋 Copy Error Details                              │ │ │
│  │  │     Share with support if problem continues         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  💾 Download Data Backup                            │ │ │
│  │  │     Save a copy of your data just in case           │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  Error Reference: ERR-2026012316423-ABCD                 │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Error Notification Components

##### Toast Notifications

| Type | Color | Icon | Duration | Position |
|------|-------|------|----------|----------|
| Success | Green | ✓ | 3 seconds | Top-right |
| Info | Blue | ℹ️ | 5 seconds | Top-right |
| Warning | Amber | ⚠️ | Until dismissed | Top-right |
| Error | Red | ❌ | Until dismissed | Top-right |

```
Toast Notification Examples:

✓ Changes saved                               [×]
  Your project has been saved successfully.

⚠️ Insurance expiring soon                    [×]
  Your insurance certificate expires in 30 days.
  [Update Insurance Info]

❌ Upload failed                              [×]
  File too large (max 25MB). Try compressing.
  [Try Again]
```

##### Progress Indicators for Long Operations

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  📄 Generating Documents...                                     │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  75%           │
│                                                                 │
│  ✓ CWA License Application                                      │
│  ✓ Shoreline Exemption Request                                  │
│  ⏳ HPA Application (generating...)                              │
│  ○ Project Summary                                              │
│  ○ Submission Checklist                                         │
│                                                                 │
│  This may take up to 30 seconds...                             │
│                                                                 │
│  [Cancel]                                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Error Codes Reference

All errors include a reference code for troubleshooting:

| Code Prefix | Category | Example |
|-------------|----------|---------|
| VAL-* | Validation errors | VAL-EMAIL-001 (invalid email format) |
| DOC-* | Document generation | DOC-GEN-FILE-001 (file processing error) |
| SAVE-* | Data persistence | SAVE-DISK-001 (disk write error) |
| LOAD-* | Data loading | LOAD-FILE-001 (file not found) |
| SYS-* | System errors | SYS-MEM-001 (memory error) |

#### Accessibility for Error Messages

| Requirement | Implementation |
|-------------|----------------|
| **Screen Reader Announcements** | Errors announced via aria-live regions |
| **Focus Management** | Focus moves to first error on form submit |
| **Color Independence** | Icons + text, not just color |
| **Keyboard Accessible** | All error links/buttons keyboard accessible |
| **Clear Language** | No jargon; reading level appropriate |

### 14.8 Local-Only Data Storage (CRITICAL)

> **IMPORTANT:** This application stores ALL data locally on the user's computer.
> No data is ever transmitted to GitHub, cloud servers, or any external service.

#### Data Storage Principles

| Principle | Implementation |
|-----------|----------------|
| **100% Local** | All data stored in user's local file system |
| **No Cloud Sync** | No data transmitted to any server |
| **No Telemetry** | Zero analytics, tracking, or usage data collection |
| **User Owns Data** | User has complete control and ownership |
| **Portable** | Data folder can be copied/moved by user |
| **No Account Required** | Works without any registration or login |

#### Where Data is Stored

```
User's Computer:
└── LakeTappsImprovements/
    └── data/                    ← All user data here
        ├── projects/            ← Project JSON files
        ├── documents/           ← Generated PDFs/DOCX
        ├── uploads/             ← User-uploaded files
        └── backups/             ← Automatic backups
```

#### What is NOT Stored

| Item | Status | Reason |
|------|--------|--------|
| Data on GitHub | ❌ Never | Privacy; local-only design |
| Data on any server | ❌ Never | Privacy; local-only design |
| User analytics | ❌ Never | Privacy commitment |
| Usage tracking | ❌ Never | Privacy commitment |
| Error reports | ❌ Never | Unless user explicitly shares |

---

## 14B. UI/UX Design Specifications (Best-in-Class)

### Design Philosophy

This application implements a **best-in-class UI/UX** designed for users with varying technical abilities, including those unfamiliar with permit processes.

#### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Clarity Over Cleverness** | Simple, obvious UI; no hidden features |
| **Forgiveness** | Easy undo; confirm destructive actions |
| **Guidance** | Clear instructions at every step |
| **Feedback** | Immediate response to every action |
| **Accessibility** | Usable by everyone |
| **Delight** | Polished animations; satisfying interactions |

### Visual Design System

#### Color Palette

| Color | Usage | Hex |
|-------|-------|-----|
| **Primary Blue** | Actions, links, focus states | `#2563EB` |
| **Success Green** | Confirmations, completed items | `#16A34A` |
| **Warning Amber** | Warnings, important notices | `#D97706` |
| **Error Red** | Errors, destructive actions | `#DC2626` |
| **Neutral Gray** | Text, borders, backgrounds | `#6B7280` |
| **Background** | Page background | `#F9FAFB` |
| **Card Background** | Content cards | `#FFFFFF` |

#### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **Headings** | Inter | 24-32px | 600-700 |
| **Body Text** | Inter | 16px | 400 |
| **Labels** | Inter | 14px | 500 |
| **Help Text** | Inter | 14px | 400 |
| **Buttons** | Inter | 16px | 500 |

#### Spacing System

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Related elements |
| md | 16px | Standard spacing |
| lg | 24px | Section spacing |
| xl | 32px | Major sections |
| 2xl | 48px | Page sections |

### Component Library

#### Buttons

```
┌─────────────────────────────────────────────────────────────────┐
│  PRIMARY ACTIONS                                                │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  Continue ➜         │  │  Save & Continue ➜  │              │
│  └─────────────────────┘  └─────────────────────┘              │
│  Blue background, white text, rounded corners, subtle shadow    │
│                                                                 │
│  SECONDARY ACTIONS                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  Save Draft         │  │  Cancel             │              │
│  └─────────────────────┘  └─────────────────────┘              │
│  White background, blue border, blue text                       │
│                                                                 │
│  DESTRUCTIVE ACTIONS                                            │
│  ┌─────────────────────┐                                        │
│  │  Delete Project     │                                        │
│  └─────────────────────┘                                        │
│  Red background, white text, requires confirmation              │
│                                                                 │
│  DISABLED STATE                                                 │
│  ┌─────────────────────┐                                        │
│  │  Continue ➜         │  (grayed out, cursor: not-allowed)    │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Form Inputs

```
┌─────────────────────────────────────────────────────────────────┐
│  STANDARD INPUT                                                 │
│  Full Legal Name *                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ John Smith                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  As it appears on your property deed                            │
│                                                                 │
│  INPUT WITH ERROR                                               │
│  Email Address *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ john@                                           ⚠️      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ❌ Please enter a valid email address                          │
│                                                                 │
│  INPUT WITH SUCCESS                                             │
│  Parcel Number *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 0123456789                                       ✓      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ✓ Valid Pierce County parcel number                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Progress Indicator

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ● ─── ● ─── ◐ ─── ○ ─── ○ ─── ○ ─── ○ ─── ○                  │
│  1     2     3     4     5     6     7     8                   │
│                                                                 │
│  1. Account ✓                                                   │
│  2. Project Type ✓                                              │
│  3. Owner Info (Current - 60% complete)                        │
│  4. Specifications                                              │
│  5. Site Info                                                   │
│  6. Permits                                                     │
│  7. Review                                                      │
│  8. Submit                                                      │
│                                                                 │
│  [Click any completed step to return]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Cards & Containers

```
┌─────────────────────────────────────────────────────────────────┐
│  STANDARD CARD                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  📋 Project Summary                                       │ │
│  │  ─────────────────────────────────────────────────────── │ │
│  │                                                           │ │
│  │  New Dock Construction                                    │ │
│  │  Estimated Cost: $18,500                                  │ │
│  │  Timeline: Aug - Sep 2026                                 │ │
│  │                                                           │ │
│  │  [View Details]                                           │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│  White background, subtle border, rounded corners, shadow       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Modals & Dialogs

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ✅ Document Generated Successfully                       │ │
│  │                                                           │ │
│  │  Your CWA License Application is ready!                   │ │
│  │                                                           │ │
│  │  NEXT STEPS:                                              │ │
│  │  1. Download your document                                │ │
│  │  2. Email to panderson@cascadewater.org                   │ │
│  │                                                           │ │
│  │  ┌───────────────┐  ┌───────────────┐                    │ │
│  │  │ Download PDF  │  │ Continue ➜    │                    │ │
│  │  └───────────────┘  └───────────────┘                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Centered, dark overlay behind, escape to close                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Design

#### Breakpoints

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| Mobile | < 640px | Phones |
| Tablet | 640px - 1024px | Tablets, small laptops |
| Desktop | > 1024px | Laptops, desktops |

#### Mobile Adaptations

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Navigation | Sidebar | Bottom tabs + hamburger |
| Forms | Multi-column | Single column |
| Tables | Full width | Horizontal scroll or cards |
| Modals | Centered | Full screen |
| Progress | Horizontal | Vertical or collapsed |

### Animations & Transitions

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transitions | Fade + slide | 200ms |
| Button hover | Scale + shadow | 150ms |
| Form field focus | Border color | 150ms |
| Modals | Fade + scale | 200ms |
| Success states | Checkmark draw | 400ms |
| Loading spinners | Rotation | Continuous |
| Toast notifications | Slide in/out | 300ms |

### Accessibility Features

| Feature | Implementation |
|---------|----------------|
| **Keyboard Navigation** | Full tab support; visible focus rings |
| **Screen Readers** | ARIA labels on all interactive elements |
| **Color Contrast** | Minimum 4.5:1 ratio for all text |
| **Font Scaling** | Responsive to browser/OS settings |
| **Reduced Motion** | Respect `prefers-reduced-motion` |
| **Error Identification** | Icon + color + text for all errors |
| **Form Labels** | All inputs have visible labels |
| **Focus Management** | Logical focus order; modal trapping |

---

## 14C. Testing Requirements

### End-to-End Testing (Playwright)

**REQUIREMENT:** All user workflows must be covered by automated Playwright tests running in a real browser.

#### Testing Framework

| Component | Technology |
|-----------|------------|
| **Test Framework** | Playwright |
| **Browsers** | Chromium, Firefox, WebKit |
| **CI/CD** | GitHub Actions |
| **Coverage Target** | 90%+ of user flows |

#### Test Categories

| Category | Description | Priority |
|----------|-------------|----------|
| **Smoke Tests** | Basic app loads and navigates | P0 |
| **Workflow Tests** | Complete user journeys | P0 |
| **Form Tests** | All input types, validation | P0 |
| **Document Generation** | PDFs generate correctly | P0 |
| **Data Persistence** | Save/load works correctly | P0 |
| **Responsive Tests** | Works on mobile/tablet/desktop | P1 |
| **Accessibility Tests** | WCAG compliance | P1 |
| **Error Handling** | Graceful error recovery | P1 |

#### Critical User Flows to Test

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYWRIGHT TEST COVERAGE                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ HAPPY PATH TESTS (P0)                                       │
│  ─────────────────────────────────────────────────────────────  │
│  □ New user completes entire workflow (dock project)           │
│  □ New user completes entire workflow (bulkhead project)       │
│  □ New user completes entire workflow (boat lift project)      │
│  □ User saves draft and resumes later                          │
│  □ User generates all documents                                 │
│  □ User downloads complete package                              │
│                                                                 │
│  ✅ DATA PERSISTENCE TESTS (P0)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  □ Auto-save works on every field change                       │
│  □ Data persists after browser close/reopen                    │
│  □ Multiple projects can be saved                               │
│  □ Project can be deleted                                       │
│  □ Backup/restore works correctly                               │
│                                                                 │
│  ✅ FORM VALIDATION TESTS (P0)                                  │
│  ─────────────────────────────────────────────────────────────  │
│  □ Required fields show errors when empty                      │
│  □ Email validation works                                       │
│  □ Phone number formatting works                                │
│  □ Numeric fields reject invalid input                         │
│  □ Date validation works                                        │
│  □ File upload accepts correct types                           │
│                                                                 │
│  ✅ CONDITIONAL LOGIC TESTS (P0)                                │
│  ─────────────────────────────────────────────────────────────  │
│  □ Dock fields appear when dock selected                       │
│  □ Bulkhead fields appear when bulkhead selected               │
│  □ HPA section hidden when maintenance exempt                  │
│  □ Building permit shown only for boathouses                   │
│  □ Federal permits shown only when triggered                   │
│                                                                 │
│  ✅ DOCUMENT GENERATION TESTS (P0)                              │
│  ─────────────────────────────────────────────────────────────  │
│  □ CWA License Application generates correctly                 │
│  □ Shoreline permit generates correctly                        │
│  □ HPA application generates correctly                         │
│  □ PDF is valid and openable                                   │
│  □ DOCX is valid and openable                                  │
│  □ All user data appears in documents                          │
│                                                                 │
│  ✅ ACCESSIBILITY TESTS (P1)                                    │
│  ─────────────────────────────────────────────────────────────  │
│  □ All pages pass axe-core checks                              │
│  □ Keyboard navigation works throughout                        │
│  □ Focus management in modals                                   │
│  □ Screen reader announcements                                  │
│                                                                 │
│  ✅ RESPONSIVE TESTS (P1)                                       │
│  ─────────────────────────────────────────────────────────────  │
│  □ Workflow completes on mobile viewport                       │
│  □ Workflow completes on tablet viewport                       │
│  □ All modals work on mobile                                   │
│  □ Forms usable on touch devices                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Test File Structure

```
tests/
├── e2e/
│   ├── workflows/
│   │   ├── dock-project.spec.ts
│   │   ├── bulkhead-project.spec.ts
│   │   ├── boat-lift-project.spec.ts
│   │   └── repair-project.spec.ts
│   ├── forms/
│   │   ├── owner-info.spec.ts
│   │   ├── project-details.spec.ts
│   │   └── insurance.spec.ts
│   ├── documents/
│   │   ├── pdf-generation.spec.ts
│   │   └── docx-generation.spec.ts
│   ├── persistence/
│   │   ├── auto-save.spec.ts
│   │   ├── resume-draft.spec.ts
│   │   └── backup-restore.spec.ts
│   └── accessibility/
│       ├── keyboard-nav.spec.ts
│       └── screen-reader.spec.ts
├── fixtures/
│   ├── test-data.json
│   └── mock-files/
└── playwright.config.ts
```

#### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/e2e/workflows/dock-project.spec.ts

# Run with UI mode (debugging)
npm run test:e2e -- --ui

# Run on specific browser
npm run test:e2e -- --project=chromium

# Generate HTML report
npm run test:e2e -- --reporter=html
```

---

## 15. Success Metrics

### 15.1 User Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Completion Rate | > 90% | Users who complete full workflow |
| Time to Complete | < 2 hours | Average time to finish workflow |
| Return Rate | > 50% | Users who return for additional projects |
| NPS Score | > 50 | Net Promoter Score |
| Support Tickets | < 5% | Users requiring support |

### 15.2 Document Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Acceptance Rate | > 98% | Documents accepted without revision |
| Error Rate | < 2% | Documents with errors caught by agencies |
| Completeness | 100% | All required fields populated |

### 15.3 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Application availability |
| Page Load | < 2 seconds | Time to interactive |
| Mobile Performance | > 90 Lighthouse | Performance score |
| Document Generation | < 10 seconds | Time to generate PDF |

---

## 16. Out of Scope

The following are explicitly **not** included in this initial release:

1. **Direct Agency Integration**: No automated submission to agency portals
2. **Payment Processing**: No fee collection on behalf of agencies
3. **Permit Status Tracking**: No real-time status from agencies
4. **Contractor Marketplace**: No contractor recommendation/booking
5. **Legal Advice**: No legal interpretation of requirements
6. **Survey/Engineering Services**: No professional design services
7. **Inspection Scheduling**: No direct scheduling with agencies
8. **Multi-Language Support**: English only in v1.0
9. **Historical Permit Records**: No import of past permits

---

## 17. Appendices

### Appendix A: Agency Contact Quick Reference

#### A.1 Named Contacts Directory

| Agency | Contact Name | Title/Role | Phone | Email |
|--------|--------------|------------|-------|-------|
| Cascade Water Alliance | **Paul Anderson** | License Applications | (425) 453-0930 | panderson@cascadewater.org |
| Pierce County | **Ray Clark** | PALS+ Business System Manager | (253) 798-2735 | ray.clark@piercecountywa.gov |
| Pierce County | **Adam Rorabaugh** | Cultural Resources Archeologist | (253) 798-2749 | Adam.rorabaugh@piercecountywa.gov |

#### A.2 General Agency Contacts

| Agency | Phone | Email | Website |
|--------|-------|-------|---------|
| Cascade Water Alliance | (425) 453-0930 | panderson@cascadewater.org | cascadewater.org |
| City of Bonney Lake Permits | (253) 447-4356 | permits@cobl.us | ci.bonney-lake.wa.us |
| City of Bonney Lake Planning | (253) 447-4356 | planning@cobl.us | ci.bonney-lake.wa.us |
| Pierce County Development | (253) 798-3739 | dlsdev@piercecountywa.gov | piercecountywa.gov |
| WDFW HPA Applications | (360) 902-2534 | HPAapplications@dfw.wa.gov | wdfw.wa.gov |
| WDFW Emergency Hotline | (360) 902-2537 | N/A (24-hour phone) | wdfw.wa.gov |
| Army Corps Seattle | (206) 764-3495 | paoteam@nws02.usace.army.mil | nws.usace.army.mil |
| Dept of Ecology Federal Permits | (360) 407-6076 | ecyrefedpermits@ecy.wa.gov | ecology.wa.gov |
| DNR Shoreline District | (360) 825-1631 | N/A | dnr.wa.gov |
| DNR Mooring Buoys | (360) 902-1100 | buoy@dnr.wa.gov | dnr.wa.gov |
| ORIA (JARPA Help) | (800) 917-0043 | help@oria.wa.gov | oria.wa.gov |

### Appendix B: Comprehensive Submission Methods Directory

#### B.1 Cascade Water Alliance (CWA)

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Email |
| **Email Address** | panderson@cascadewater.org |
| **Phone** | (425) 453-0930 |
| **Website** | https://cascadewater.org/lake-tapps/licenses-permits/ |
| **Physical Address** | Not typically required for submission |
| **Accepted Formats** | PDF attachments |
| **Notes** | Submit application and all questions to email address |

---

#### B.2 City of Bonney Lake

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Online Portal (Electronic submission REQUIRED) |
| **Online Portal URL** | https://web.ci.bonney-lake.wa.us |
| **Portal Login** | Account required - select "Apply Now" |
| **General Email** | permits@cobl.us |
| **Shoreline Questions Email** | planning@cobl.us |
| **Phone** | (253) 447-4356 |
| **Inspection Line** | (253) 447-4357 |
| **Fax** | (253) 862-1116 |
| **Physical Address** | Public Services Center, 21719 96th St E, Buckley, WA 98321 |
| **Mailing Address** | City of Bonney Lake, Attn: Permit Center, 21719 96th St E, Buckley, WA 98321 |
| **Office Hours** | Monday-Thursday 9:00 AM - 4:00 PM, Fridays by Appointment Only |
| **Notes** | All applications, documents, and plans MUST be submitted electronically |

---

#### B.3 Pierce County Planning & Public Works

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Online (PALS+) |
| **Online Portal URL** | https://pals.piercecountywa.gov/palsonline/ |
| **General Info URL** | https://www.piercecountywa.gov/ApplyForAPermit |
| **Email** | dlsdev@piercecountywa.gov |
| **Phone** | (253) 798-3739 |
| **Physical Address** | Pierce County Annex East Entrance, 2401 S 35th St, Tacoma, WA 98409 |
| **Office Hours** | Monday-Friday 8:00 AM - 4:00 PM |
| **PALS+ Support Email** | ray.clark@piercecountywa.gov |
| **PALS+ Support Phone** | (253) 798-2735 |
| **Notes** | Create account to apply, make payments, check status, request inspections |

---

#### B.4 Washington Department of Fish & Wildlife (WDFW) - HPA

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Online (APPS) - FASTEST |
| **Online Portal URL** | https://hpa.wdfw.wa.gov/ |
| **Alternative Portal** | http://wdfw.wa.gov/licensing/hpa/ |
| **Email (alternative)** | HPAapplications@dfw.wa.gov |
| **General Phone** | (360) 902-2534 |
| **Emergency Hotline (24-hour)** | (360) 902-2537 |
| **TDD** | (360) 902-2207 |
| **Fax** | (360) 902-2946 |
| **Mailing Address** | Washington Department of Fish and Wildlife, P.O. Box 43234, Olympia, WA 98504-3234 |
| **Website** | https://wdfw.wa.gov/licenses/environmental/hpa |
| **Application Page** | https://wdfw.wa.gov/licenses/environmental/hpa/application |
| **Notes** | Online via APPS is fastest; hard copy via email/mail takes longer |

---

#### B.5 U.S. Army Corps of Engineers - Seattle District

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Online (RRS) or Mail |
| **Online Portal URL** | https://rrs.usace.army.mil/rrs |
| **Apply for Permit Page** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Apply-For-A-Permit/ |
| **Permit Guidebook** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Permit-Guidebook/ |
| **General Email** | paoteam@nws02.usace.army.mil |
| **Phone** | (206) 764-3495 |
| **Fax** | (206) 764-6602 |
| **Mailing Address** | Seattle District Corps of Engineers, Regulatory Branch (CENWS-OD-RG), P.O. Box 3755, Seattle, WA 98124-3755 |
| **Physical Address** | Seattle District U.S. Army Corps of Engineers, 4735 E. Marginal Way S., Bldg 1202, Seattle, WA 98134-2388 |
| **Website** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/ |
| **Contact Page** | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Contact-Us/ |
| **Notes** | RRS is new online system (launched May 2024); mail still accepted |

---

#### B.6 Washington Department of Ecology - 401 Certification

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Email ONLY (mail NOT accepted) |
| **Email Address** | ecyrefedpermits@ecy.wa.gov |
| **Phone** | (360) 407-6076 |
| **Relay Service/TTY** | 711 or (877) 833-6341 |
| **Mailing Address** | Mail submissions NOT accepted |
| **Website** | https://ecology.wa.gov/regulations-permits/permits-certifications/401-water-quality-certification |
| **Large Files (>25MB)** | Email ecyrefedpermits@ecy.wa.gov to request secure upload link |
| **Notes** | Include Aquatics ID and project name when requesting upload link |

---

#### B.7 Washington Department of Natural Resources (DNR) - Aquatic Use Authorization

| Submission Type | Details |
|-----------------|---------|
| **Primary Method** | Mail to regional office |
| **Shoreline District Office** | 950 Farman Avenue N, Enumclaw, WA 98022-9282 |
| **Shoreline District Phone** | (360) 825-1631 |
| **Application Fee** | $25 (include with Attachment E) |
| **Notes** | Lake Tapps is in Shoreline District; include JARPA Attachment E |

**Mooring Buoy Applications (if applicable):**
| Field | Details |
|-------|---------|
| **Email** | buoy@dnr.wa.gov |
| **Mailing Address** | DNR Aquatic Resources Division, 1111 Washington St. SE, MS 47027, Olympia, WA 98504-7027 |
| **Phone** | (360) 902-1100 |

---

#### B.8 U.S. Coast Guard - Private Aids to Navigation (if applicable)

| Submission Type | Details |
|-----------------|---------|
| **Mailing Address** | 915 Second Avenue, Room 3510, Seattle, WA 98174-1067 |
| **Phone** | (206) 220-7285 |
| **Fax** | (206) 220-7265 |

---

#### B.9 U.S. Environmental Protection Agency - Tribal Lands (if applicable)

| Submission Type | Details |
|-----------------|---------|
| **Email** | r10-401-certs@epa.gov |
| **Mailing Address** | 1200 6th Avenue, Suite 900, Seattle, WA 98101 |
| **Phone** | (206) 553-0058 |
| **Notes** | Only for projects on tribal lands requiring 401 certification |

---

#### B.10 JARPA (Joint Aquatic Resource Permit Application) Resources

| Resource | Details |
|----------|---------|
| **Main JARPA Page** | https://www.oria.wa.gov/site/alias__oria/4217/jarpa.aspx |
| **JARPA Form (PDF)** | https://www.oria.wa.gov/Portals/_oria/VersionedDocuments/JARPA-Documents/JARPA.pdf |
| **JARPA Form (Word)** | https://www.oria.wa.gov/Portals/_oria/VersionedDocuments/JARPA-Documents/JARPA.docx |
| **Instructions A (PDF)** | https://www.oria.wa.gov/Portals/_oria/VersionedDocuments/JARPA-Documents/JARPA%20Instruction%20A.pdf |
| **Instructions B (PDF)** | https://www.oria.wa.gov/Portals/_oria/VersionedDocuments/JARPA-Documents/JARPA%20Instruction%20B.pdf |
| **Contact Information Page** | https://www.oria.wa.gov/site/alias__oria/4222/jarpa-contacts.aspx |
| **ORIA Help Phone** | (800) 917-0043 or (360) 725-0628 |
| **ORIA Help Email** | help@oria.wa.gov |
| **ORIA Hours** | 8:00 AM - 5:00 PM, Monday-Friday |

**JARPA Attachments:**
| Attachment | Purpose | Download |
|------------|---------|----------|
| Attachment A | Additional Property Owners | JARPA Attachment A.pdf |
| Attachment B | Additional Project Locations | JARPA Attachment B.pdf |
| Attachment C | Adjoining Property Owner Info | JARPA Attachment C.pdf |
| Attachment D | Construction Sequence | JARPA Attachment D.pdf |
| Attachment E | DNR Aquatic Lands Authorization | JARPA Attachment E.pdf |

**Pre-Submission Requirement:**
- Call 8-1-1 at least two business days before digging (http://www.callbeforeyoudig.org/)

---

#### B.11 Submission Methods Quick Reference Matrix

| Agency | Online URL | Email | Mail Address | Phone |
|--------|------------|-------|--------------|-------|
| **CWA** | N/A | panderson@cascadewater.org | N/A | (425) 453-0930 |
| **City of Bonney Lake** | web.ci.bonney-lake.wa.us | permits@cobl.us | 21719 96th St E, Buckley, WA 98321 | (253) 447-4356 |
| **Pierce County** | pals.piercecountywa.gov/palsonline/ | dlsdev@piercecountywa.gov | 2401 S 35th St, Tacoma, WA 98409 | (253) 798-3739 |
| **WDFW (HPA)** | hpa.wdfw.wa.gov | HPAapplications@dfw.wa.gov | P.O. Box 43234, Olympia, WA 98504-3234 | (360) 902-2534 |
| **Army Corps** | rrs.usace.army.mil/rrs | paoteam@nws02.usace.army.mil | P.O. Box 3755, Seattle, WA 98124-3755 | (206) 764-3495 |
| **Dept of Ecology** | N/A | ecyrefedpermits@ecy.wa.gov | Mail NOT accepted | (360) 407-6076 |
| **DNR (Shoreline)** | N/A | N/A | 950 Farman Ave N, Enumclaw, WA 98022 | (360) 825-1631 |

### Appendix C: CWA Property Management Policy - Table 1 (CWAC 7.05.050)

*Source: Cascade Water Alliance Code, Chapter 7.05 "White River – Lake Tapps Reservoir Property Management Policy"*

#### C.1 Key Terms

| Term | Meaning |
|------|---------|
| **License required** | Formal license from CWA required before construction |
| **Permission required** | CWA will consider on case-by-case basis |
| **No action** | CWA will generally take no action |
| **Not allowed** | Cannot be permitted; jeopardizes safe operation |
| **Required removal** | Must be removed |
| **Generally not allowed** | New requests typically denied, exceptions for Dikes 3, 10, 11 |

#### C.2 Table 1: Improvement Types and CWA Permission Requirements

| Improvement Type | Existing | New/Modification |
|------------------|----------|------------------|
| **Beaches** | No action on other properties | Permission required |
| **Boat Lifts** | Permission required (1) | Permission required, generally not allowed on dikes (1, 2) |
| **Boat/PWC Storage** | Removal may be required (3) | Not allowed |
| **Boat Storage - Temporary** | Permission required if mechanically installed | Permission required if mechanically installed |
| **Boathouses** | Permission required | Not allowed on dikes, permission required on other properties |
| **Bulkheads** | Permission required (4) | Not allowed on dikes, permission required for other properties (4) |
| **Decks** | No action | Permission required (6) |
| **Docks (including floating)** | Permission required (8) | Permission required (8), generally not allowed on dikes (2) |
| **Drainage** | Permission required (7) | Not allowed on dikes, permission required on other properties (7) |
| **Dredging** | Permission required | Not allowed on dikes, permission required on other properties |
| **Fill (below 545' line)** | Permission required (5) | Not allowed |
| **Fire pits** | Permission required | Permission required, generally not allowed on dikes (2) |
| **Floats** | Permission required (9) | Not allowed on dikes, permission required on other properties (9) |
| **Floating Platforms** | Not allowed | Not allowed |
| **Lighting** | Permission required | Permission required, generally not allowed on dikes (2) |
| **Moorage Buoys** | Required removal | Not allowed |
| **Paths/Steps/Stairs** | Permission required | Not allowed on dikes, permission required on other properties |
| **Patios** | Permission required | Not allowed on dikes, permission required on other properties |
| **Water Withdrawal** | Required removal on other properties | Not allowed |

#### C.3 Table 1 Footnotes (Official)

| # | Requirement |
|---|-------------|
| **(1)** | New or modified boat lifts must use **non-oil-based technology** |
| **(2)** | CWA, in sole discretion with consultants, determines if activity allowed on dike. New requests generally not allowed; exceptions possible for **Dikes 3, 10 and 11** |
| **(3)** | CWA may require removal for health/safety, legal/financial risk, or operational purposes |
| **(4)** | **Bulkheads**: CWA recommends constructing to account for lake levels **up to 543 feet** |
| **(5)** | CWA may approve minor fill with appropriate engineering and slope stabilization |
| **(6)** | Decks must meet setback requirements from water/dike |
| **(7)** | Any point source or non-point source discharge that could adversely impact water quality/quantity is **not allowed** |
| **(8)** | **Docks** are solely for personal use of adjacent property owner. CWA may limit dock size to protect Project purposes |
| **(9)** | Permission for vegetation required only if required by Bonney Lake or Pierce County |

#### C.4 CWA License Standard Conditions (CWAC 7.05.050)

All CWA licenses include these standard conditions:

1. **License Term**: Continues unless terminated for breach OR CWA determines termination necessary for municipal water supply operation
2. **Applicant Protection Requirements**: Must demonstrate protection against operational dangers (dike integrity, water quality, recreational safety); may require professional opinions at applicant's expense
3. **Compliance**: Must comply with all applicable federal, state, and local laws
4. **Liability Release**: Applicant releases CWA from all liability including:
   - Flooding damage from CWA raising water to **545 feet**
   - Wave action damage
   - Damage from lowering/raising water levels
5. **Indemnification**: Full indemnification of CWA required
6. **Insurance**: Proof of homeowner's insurance AND contractor's insurance (if construction involved):
   - Must name **Cascade Water Alliance as Additional Insured**
   - Must be **updated annually**
7. **Construction Standards**: Improvements must comply with CWA standards
8. **Inspections**: CWA may inspect at any time upon 24 hours' notice
9. **Successor Binding**: License terms bind future property owners
10. **No Administrative Fee**: Currently no fee, but applicant pays for professional services required
11. **Permits Required**: Applicant must obtain all permits required by local and state regulators
12. **Dike Integrity**: Maintenance of dike integrity is paramount; use on dikes may be restricted

#### C.5 Lake Level Reference

| Level | Elevation | Notes |
|-------|-----------|-------|
| **Maximum Pool** | 545 feet | CWA can raise to this level per 1954 deed |
| **Typical Summer Recreation** | 541.5' - 543' | Normal operating range |
| **Recommended Bulkhead Minimum** | 544 feet | Build bulkheads at or above this level |
| **Property Owners' Risk** | All levels | Owners assume all risk from level changes |

---

### Appendix D: Key Document Links

| Document | URL |
|----------|-----|
| CWA Licenses & Permits Page | https://cascadewater.org/lake-tapps/licenses-permits/ |
| CWA License Application | https://cascadewater.org/wp-content/uploads/2021/04/License-Application-0401-2021.pdf |
| CWA Insurance Requirements | https://cascadewater.org/wp-content/uploads/2024/12/1-Lake-Tapps-Insurance-Requirements-Infosheet-2024.pdf |
| CWA Sample License | https://cascadewater.org/wp-content/uploads/2020/08/License-for-Use-of-Lake-Tapps-Reservoir-0804-2020-SAMPLE-FOR-WEB.pdf |
| Homeowner's Guide | https://cascadewater.org/wp-content/uploads/2023/01/Homeowners-Guide-to-Living-on-the-Lake-2023.pdf |
| CWA Code (Property Management) | https://www.codepublishing.com/WA/CascadeWaterAlliance/#!/CascadeWaterAlliance07/CascadeWaterAlliance07.html |
| City of Bonney Lake Permit Center | https://www.ci.bonney-lake.wa.us/Government/Departments/Public_Services/Permit_Center |
| Pierce County Development | https://www.piercecountywa.gov/903/Development-Center |
| WDFW HPA | https://wdfw.wa.gov/licenses/environmental/hpa |
| Army Corps Seattle Regulatory | https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/ |
| JARPA Resource Center | https://www.oria.wa.gov/site/alias__oria/4217/jarpa.aspx |
| JARPA Form (PDF) | https://www.oria.wa.gov/Portals/_oria/VersionedDocuments/JARPA-Documents/JARPA.pdf |
| JARPA Form (Word) | https://www.oria.wa.gov/Portals/_oria/VersionedDocuments/JARPA-Documents/JARPA.docx |
| Dept of Ecology 401 Certification | https://ecology.wa.gov/regulations-permits/permits-certifications/401-water-quality-certification |

---

### Appendix E: Glossary

| Term | Definition |
|------|------------|
| **CWA** | Cascade Water Alliance |
| **HPA** | Hydraulic Project Approval (WDFW permit) |
| **JARPA** | Joint Aquatic Resource Permit Application |
| **APPS** | Aquatic Protection Permitting System (WDFW) |
| **SDP** | Shoreline Substantial Development Permit |
| **SCUP** | Shoreline Conditional Use Permit |
| **SVAR** | Shoreline Variance |
| **SEPA** | State Environmental Policy Act |
| **OHWL** | Ordinary High Water Line |
| **MLLW** | Mean Lower Low Water |
| **Section 10** | Rivers & Harbors Act permit for navigable waters |
| **Section 404** | Clean Water Act permit for discharge of fill material |
| **NWP** | Nationwide Permit (pre-authorized by Army Corps) |
| **PCN** | Pre-Construction Notification |
| **Fetch** | Distance across water to opposite shore |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | Initial | Initial draft |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Technical Lead | | | |
| Stakeholder | | | |

---

*This PRD is a living document and will be updated as requirements evolve and additional information becomes available.*
