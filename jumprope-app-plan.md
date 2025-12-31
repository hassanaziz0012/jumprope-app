# 🏋️ JumpRope Tracker App - Planning Document

**Version:** 1.0 Draft  
**Created:** 2025-12-27  
**Status:** Planning Phase

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Core Features](#core-features)
4. [Screens & Navigation](#screens--navigation)
5. [Gamification & Engagement](#gamification--engagement)
6. [Social Sharing](#social-sharing)
7. [Design System](#design-system)
8. [Decisions Made](#decisions-made)

---

## 🎯 Overview

A minimal, offline-first mobile app for tracking jump rope workouts. The app helps users log their sessions, visualize progress through customizable charts, maintain workout streaks, and achieve personal fitness goals.

### Core Philosophy
- **Offline-first**: All data stored locally, no cloud dependency
- **Minimal & focused**: Do one thing exceptionally well
- **Delightful UX**: Smooth animations, satisfying interactions, celebratory moments
- **Customizable**: Users control what metrics matter to them

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React Native + Expo | Cross-platform (iOS & Android) |
| **Language** | TypeScript | Type safety, better DX |
| **Navigation** | React Navigation | Screen transitions, deep linking |
| **Animations** | React Native Reanimated 3 | 60fps buttery animations |
| **Charts** | Victory Native / React Native Skia | Beautiful, customizable charts |
| **Storage** | Expo SQLite or WatermelonDB | Local database for workouts |
| **State** | Zustand or Jotai | Lightweight state management |
| **Notifications** | Expo Notifications | Local push notifications |
| **Sharing** | Expo Sharing + React Native Share | Social media integration |

---

## ✨ Core Features

### 1. Workout Logging

Each workout entry tracks:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Auto | Unique identifier |
| `date` | DateTime | Yes | When the workout occurred |
| `duration` | Number | Yes | In seconds or minutes |
| `totalSkips` | Number | Yes | Total jump count |
| `avgSkipsPerMinute` | Number | Auto-calc | Derived from duration + totalSkips |
| `trips` | Number | Yes | Interruptions/misses |
| `calories` | Number | Optional | Estimated calories burned |
| `heartRateAvg` | Number | Optional | Average BPM |
| `heartRateMax` | Number | Optional | Peak BPM |
| `notes` | String | Optional | Free-form workout notes |
| `createdAt` | DateTime | Auto | Record creation timestamp |

**Optional Fields (Future Consideration):**
- `ropeUsed` - Track different ropes if user has multiple
- `location` - Quick tag (home, gym, outdoor)
- `mood` - Pre/post workout mood (optional, for correlation insights)

---

### 2. Dashboard / Home Screen

The main screen users see when opening the app.

#### Components:
1. **Quick Stats Header**
   - Today's workout summary (or prompt to log one)
   - Current streak counter (with fire/flame icon animation)
   - Weekly progress ring/bar

2. **Custom Charts Section**
   - User-defined charts (configurable)
   - Default charts: Weekly skips trend, Calories over time
   - Each chart is a card that can be reordered/removed
   
3. **Recent Workouts List**
   - Scrollable list of workout cards
   - Swipe actions (edit, delete, share)
   - Tap to view full details

4. **Floating Action Button (FAB)**
   - Primary "Log Workout" action
   - Satisfying press animation

---

### 3. Custom Charts System

Users can create personalized tracking charts:

#### Configurable Options:
- **Metric**: totalSkips, avgSkipsPerMinute, calories, duration, trips, heartRate
- **Time Range**: Last 7 days, 30 days, 90 days, Year, All time
- **Chart Type**: Line, Bar, Area (maybe pie for distribution data)
- **Aggregation**: Daily, Weekly, Monthly

#### Preset Templates:
1. "Weekly Skips" - Bar chart, last 7 days, totalSkips
2. "Monthly Calories" - Line chart, last 30 days, calories
3. "Skip Rate Trend" - Area chart, last 30 days, avgSkipsPerMinute
4. "Trip Reduction" - Line chart, last 30 days, trips (goal: trend down!)

---

### 4. Streak Tracking

**Streak Logic:**
- A "workout day" counts if user logged at least 1 workout
- Streak increments for consecutive days
- Streak resets if a day is missed

**Streak Milestones:**
| Days | Milestone | Badge/Celebration |
|------|-----------|-------------------|
| 3 | Getting Started | 🌱 |
| 7 | One Week Strong | 🔥 |
| 14 | Two Weeks | 💪 |
| 30 | Monthly Master | 🏆 |
| 60 | Two Months | ⭐ |
| 90 | Quarterly Champion | 👑 |
| 180 | Half Year Hero | 🎖️ |
| 365 | Year of Dedication | 🏅 |

**Streak Features:**
- Visual streak counter on dashboard (animated flame that grows with streak)
- Push notification reminders (evening reminder if no workout logged)
- No streak freeze - if it breaks, it breaks (tough love approach!)

---

### 5. Rest Days

Users can preserve their streak while taking planned recovery days.

**How Rest Days Work:**
- User must **manually mark a day as a rest day** before midnight
- Rest days do NOT break the streak
- Rest days are clearly indicated on the calendar/history
- Cannot retroactively mark a day as rest (must be done same day)

**Rest Day UI:**
- Button on dashboard: "Mark Today as Rest Day"
- Confirmation dialog explaining streak preservation
- Visual indicator on calendar (different color/icon)
- Rest day history tracking

**Limits (optional, decide during implementation):**
- Consider max rest days per week (e.g., 2) to prevent abuse
- Or unlimited if we trust users to self-regulate

---

### 6. Goal Tracking

Users set personal targets with predefined templates. Goals are managed in a **dedicated Goals sub-page** with full CRUD functionality.

#### Goal Templates:

| Template | Description | Tracking Period |
|----------|-------------|-----------------|
| **Daily Skips** | Hit X total skips per day | Daily |
| **Weekly Skips** | Hit X total skips per week | Weekly (Mon-Sun) |
| **Weekly Workouts** | Complete X workouts per week | Weekly |
| **Daily Calories** | Burn X calories per day | Daily |
| **Weekly Calories** | Burn X calories per week | Weekly |
| **Weekly Duration** | Jump for X minutes per week | Weekly |
| **Skip Rate Goal** | Maintain X avg skips/min | Per workout |

#### Goal Management:
- **Multiple simultaneous goals** allowed (no limit)
- **Create**: Pick template → set target value → activate
- **Read**: See all goals on Goals sub-page with progress
- **Update**: Modify target value, pause/resume goal
- **Delete**: Remove goal (with confirmation)

#### Goal UI:
- Progress bar/ring showing % completion
- Celebratory animation when goal is reached
- History of goal completions
- "Active" vs "Completed Today" vs "Missed" status indicators

#### Goal Reset Logic:
- **Daily goals**: Reset at midnight local time
- **Weekly goals**: Reset Monday at midnight local time
- **Per-workout goals**: Evaluated after each workout logged

---

### 7. Data Export

**CSV Export Options:**
- Export all workouts
- Export date range
- Export current month/year

**CSV Fields:**
```
date, time, duration_minutes, total_skips, avg_skips_per_minute, trips, calories, heart_rate_avg, heart_rate_max, notes
```

**Export Flow:**
1. User taps "Export Data" in settings
2. Selects date range or "All"
3. CSV generated and shared via system share sheet
4. Can save to Files, email, cloud storage, etc.

---

### 8. Onboarding Flow

First-time users are guided through a welcoming introduction to the app.

**Onboarding Screens:**

1. **Welcome Screen**
   - App logo + tagline
   - "Track your jump rope journey"
   - Animated jump rope illustration

2. **Feature Highlights** (2-3 swipeable cards)
   - "Log your workouts easily"
   - "Set goals and crush them"
   - "Build streaks, earn badges"
   - Beautiful illustrations for each

3. **Quick Setup**
   - Optional: Set your first goal
   - Optional: Enable notifications
   - Skip option available

4. **Ready to Jump!**
   - CTA: "Log Your First Workout" → opens log workout modal
   - Secondary: "Explore the app first"

**Onboarding Behavior:**
- Shows only on first app launch
- Cannot be skipped entirely (must reach final screen)
- Quick setup steps can be skipped individually
- Flag stored locally: `hasCompletedOnboarding: true`

---

## 📱 Screens & Navigation

### Screen Map

```
┌─────────────────────────────────────────────────────────┐
│                      App                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Home /    │  │   Stats /   │  │  Settings   │     │
│  │  Dashboard  │  │   History   │  │             │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Log Workout │  │  Workout    │  │   Goals     │     │
│  │   (Modal)   │  │   Detail    │  │   Manager   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │   Chart     │  │   Share     │                      │
│  │  Customizer │  │   Preview   │                      │
│  └─────────────┘  └─────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Navigation Structure

**Bottom Tab Navigator:**
1. **Home** - Dashboard with charts, streaks, recent workouts
2. **History** - Full workout log with calendar view, filters, rest day marking
3. **Settings** - App preferences, goals sub-page, achievements, export, about

**Modal/Stack Screens:**
- Onboarding (first launch only)
- Log Workout (slides up from bottom)
- Workout Detail (push navigation, with edit/delete)
- Edit Workout
- Goals Manager (sub-page with full CRUD)
- Goal Editor (create/edit individual goal)
- Chart Customizer
- Achievements Gallery
- Share Preview
- Mark Rest Day

---

## 🎮 Gamification & Engagement

### Achievement System (Core Feature)

Predefined badges users can earn:

#### 🏃 Getting Started
| Badge | Requirement | Icon |
|-------|-------------|------|
| First Skip | Log your first workout | 🎉 |
| Week One | Complete 7 days of using the app | 📅 |
| Data Lover | Log 10 workouts | 📊 |

#### 🔢 Skip Milestones (Single Session)
| Badge | Requirement | Icon |
|-------|-------------|------|
| Century | 100 skips in one session | 💯 |
| Five Hundred | 500 skips in one session | 🎯 |
| Thousand Club | 1,000 skips in one session | 🏅 |
| Double Thousand | 2,000 skips in one session | ⚡ |
| Skip Legend | 5,000 skips in one session | 🌟 |

#### 📈 Lifetime Totals
| Badge | Requirement | Icon |
|-------|-------------|------|
| 10K Total | 10,000 lifetime skips | 🥉 |
| 50K Total | 50,000 lifetime skips | 🥈 |
| 100K Total | 100,000 lifetime skips | 🥇 |
| Half Million | 500,000 lifetime skips | 💎 |
| Million Club | 1,000,000 lifetime skips | 👑 |

#### 🔥 Streak Achievements
| Badge | Requirement | Icon |
|-------|-------------|------|
| Consistent | 7-day streak | 🔥 |
| Dedicated | 30-day streak | 💪 |
| Committed | 60-day streak | ⭐ |
| Obsessed | 100-day streak | 🏆 |
| Unstoppable | 365-day streak | 👑 |

#### ⚡ Performance
| Badge | Requirement | Icon |
|-------|-------------|------|
| Speed Demon | 150+ avg skips/min | ⚡ |
| Lightning | 180+ avg skips/min | ⚡⚡ |
| Untouchable | 200+ avg skips/min | 🌩️ |
| Perfect Form | Complete a workout with 0 trips | ✨ |
| Flawless Five | 5 workouts in a row with 0 trips | 💫 |

#### ⏰ Time-Based
| Badge | Requirement | Icon |
|-------|-------------|------|
| Early Bird | Workout before 6 AM | 🌅 |
| Night Owl | Workout after 10 PM | 🦉 |
| Marathon | Single workout over 30 minutes | 🏃 |
| Ultra Marathon | Single workout over 60 minutes | 🏃‍♂️ |

#### 🔥 Calorie Crushers
| Badge | Requirement | Icon |
|-------|-------------|------|
| Burner | Burn 100 calories in one session | 🔥 |
| Inferno | Burn 500 calories in one session | 🌋 |
| Weekly Warrior | Burn 2,000 calories in one week | 💥 |

#### 🎯 Goal Achievements
| Badge | Requirement | Icon |
|-------|-------------|------|
| Goal Getter | Complete your first goal | 🎯 |
| Goal Crusher | Complete 10 goals | 💪 |
| Goal Master | Complete 50 goals | 🏆 |
| Perfect Week | Hit all goals for 7 days straight | ⭐ |

### Personal Records

Track and celebrate PRs for:
- **Most skips** in a single session
- **Highest skip rate** (avg skips/min)
- **Longest duration** workout
- **Most calories** burned in one session
- **Longest streak** ever achieved

When a PR is broken:
- Big celebratory animation
- Prompt to share on socials
- PR history tracked (show old PR vs new)

### Motivational Elements

1. **Celebration Animations**
   - Confetti burst on goal completion
   - Streak fire animation (grows larger with streak)
   - Personal record callouts with fanfare
   - Badge unlock animations

2. **Smart Notifications**
   - Morning motivation quote
   - Evening streak reminder (if no workout logged yet)
   - Weekly summary notification
   - Milestone celebrations
   - "You're close!" nudges (e.g., "50 more skips to hit your daily goal!")

3. **Progress Visualization**
   - Before/after comparisons
   - "This week vs last week" overlays
   - Personal record highlights on dashboard
   - Achievement progress bars (e.g., "80% to next badge")

---

## 📤 Social Sharing

### Shareable Moments

Trigger share prompts on:
1. ✅ New workout logged (optional, user-initiated)
2. 🎯 Daily/weekly goal achieved
3. 🔥 Streak milestones (7, 30, 60, 90, 180, 365 days)
4. 🏆 Personal records (most skips, longest duration, etc.)
5. 📊 Weekly/monthly summaries

### Share Card Design

Generate beautiful, branded share cards:

```
┌────────────────────────────────┐
│  🔥 7-DAY STREAK!              │
│                                │
│  ┌──────────────────────────┐  │
│  │    [Fire Animation/      │  │
│  │     Graphic]             │  │
│  └──────────────────────────┘  │
│                                │
│  Total Skips: 12,450           │
│  This Week: 2,100              │
│  Calories: 850                 │
│                                │
│  #JumpRopeTracker              │
│  Get the app: [link]          │
└────────────────────────────────┘
```

### Supported Platforms

- Instagram Stories
- Twitter/X
- Facebook
- WhatsApp
- TikTok
- General share (copy link, save image)

### Implementation

1. Use react-native-view-shot to capture share card as image
2. Expo Sharing for native share sheet
3. Pre-formatted text with stats + hashtags
4. Deep link back to app (for virality)

---

## 🎨 Design System

### Theme Support

- **Light Mode**: Clean, energetic, white backgrounds
- **Dark Mode**: Easy on eyes, OLED-friendly blacks
- System preference detection + manual toggle

### Design Notes

- User will design in Figma
- AI will translate Figma designs to code
- Focus on:
  - Smooth 60fps animations
  - Satisfying micro-interactions
  - Haptic feedback on actions
  - Consistent spacing and typography

### Animation Principles

1. **Purposeful**: Every animation serves a function
2. **Quick**: Most transitions 200-300ms
3. **Natural**: Use spring physics, not linear easing
4. **Delightful**: Subtle surprises that make users smile

---

## ✅ Decisions Made

All major questions have been resolved:

### Data & Storage
| Question | Decision |
|----------|----------|
| Workout editing? | ✅ **Full CRUD** - Create, Read, Update, Delete all supported |
| Max history? | 📦 All time - keep everything locally |
| Backup strategy? | 📤 CSV export for manual backup |

### Goals
| Question | Decision |
|----------|----------|
| Multiple active goals? | ✅ **Yes** - Users can have unlimited simultaneous goals |
| Goals management? | 📋 **Dedicated Goals sub-page** with full CRUD |
| Goals reset? | 🔄 Auto-reset based on period (daily resets at midnight, weekly resets Monday) |
| Historical completion? | 📊 Yes, track and display goal completion history |

### Streaks & Rest Days
| Question | Decision |
|----------|----------|
| Day reset time? | 🕛 **Midnight local time** |
| Streak freeze? | ❌ **No** - If it breaks, it breaks (tough love!) |
| Rest days? | ✅ **Allowed** - User must manually mark a day as rest day to preserve streak |

### UX & Onboarding
| Question | Decision |
|----------|----------|
| Onboarding flow? | ✅ **Required** for first-time users |
| Empty state? | 🎨 Design in Figma - make it welcoming and guide to first workout |
| Daily prompts? | 🔔 Evening reminder if no workout logged (optional, user can disable) |

### Charts
| Question | Decision |
|----------|----------|
| Max custom charts? | ♾️ **No limit** - users can create as many as they want |
| Individual chart sharing? | 🤔 TBD during implementation |
| Comparison overlays? | 🤔 TBD during implementation |

### Sharing
| Question | Decision |
|----------|----------|
| Watermarks? | ❌ **No watermarks** on share images |
| App link? | ✅ Include app link in the **post caption/text** |
| Captions? | 🤖 Auto-generated with stats + hashtags |
| Frequency limits? | 🚫 No limits - user-initiated shares only |

---

## 📝 Next Steps

1. [x] ~~Finalize answers to open questions~~ ✅ DONE
2. [ ] Design screens in Figma
3. [ ] Set up development environment (Expo in WSL)
4. [ ] Scaffold project structure
5. [ ] Implement core data model and storage
6. [ ] Build screens based on Figma designs
7. [ ] Add animations and polish
8. [ ] Testing on iOS and Android
9. [ ] Prepare for app store submission

---

*This document is a living plan. Update as decisions are made.*
