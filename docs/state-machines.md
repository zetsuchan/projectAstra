# State Machine Diagrams

Visual representation of component state flows in Project Astra.

---

## 1. Onboarding Flow

```mermaid
stateDiagram-v2
    [*] --> Welcome
    Welcome --> SunSignEntry: tap_start

    SunSignEntry --> BirthDateLocation: sun_sign_selected
    SunSignEntry --> BirthDateLocation: birthday_entered

    BirthDateLocation --> BirthTime: data_entered
    BirthDateLocation --> BirthTime: skipped

    BirthTime --> MoonRising: time_entered
    BirthTime --> BirthTimeFallback: unknown
    BirthTimeFallback --> MoonRising: fallback_selected

    MoonRising --> PersonaSetup: data_entered
    MoonRising --> PersonaSetup: skipped

    PersonaSetup --> RelationshipAdd: persona_configured
    PersonaSetup --> RelationshipAdd: skipped

    RelationshipAdd --> DiaryCadence: relationship_added
    RelationshipAdd --> DiaryCadence: skipped

    DiaryCadence --> Complete: cadence_selected

    Complete --> [*]: finish

    state BirthTimeFallback {
        [*] --> AskSource
        AskSource --> CertificateReminder: dont_know
        AskSource --> NoonDefault: use_noon
        CertificateReminder --> NoonDefault: continue
        NoonDefault --> [*]
    }
```

**States:**
| State | Required | Data Captured |
|-------|----------|---------------|
| Welcome | - | - |
| SunSignEntry | ✅ | `sun_sign` |
| BirthDateLocation | ○ | `birth_date`, `birth_location` |
| BirthTime | ○ | `birth_time`, `birth_time_source` |
| MoonRising | ○ | `moon_sign`, `rising_sign` |
| PersonaSetup | ○ | `persona_name`, `voice_style` |
| RelationshipAdd | ○ | First relationship |
| DiaryCadence | ✅ | `diary_cadence` |

---

## 2. Chat Thread Lifecycle

```mermaid
stateDiagram-v2
    [*] --> New: create_thread

    New --> Active: first_message

    Active --> Active: send_message
    Active --> Active: receive_response
    Active --> Summarizing: threshold_reached

    Summarizing --> Active: summary_saved

    Active --> Renamed: rename
    Renamed --> Active: continue_chat

    Active --> Archived: archive
    Archived --> Active: unarchive

    Active --> Deleted: delete
    Archived --> Deleted: delete

    Deleted --> [*]

    state Active {
        [*] --> AwaitingInput
        AwaitingInput --> Processing: user_sends
        Processing --> AwaitingInput: response_received
    }
```

**Memory States (per-thread):**
```mermaid
stateDiagram-v2
    [*] --> NoMemory

    NoMemory --> Building: messages_accumulate
    Building --> Summarized: auto_summarize
    Summarized --> Building: new_messages

    Summarized --> Cleared: user_forget
    Building --> Cleared: user_forget
    Cleared --> Building: new_messages

    note right of Summarized
        Rolling summary updated
        every N messages
    end note
```

---

## 3. Diary Entry Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Drafting: start_entry

    Drafting --> Drafting: typing
    Drafting --> Saved: save

    Saved --> Saved: edit
    Saved --> WithMood: add_mood
    WithMood --> Saved: remove_mood

    Saved --> Reflecting: tap_reflect
    WithMood --> Reflecting: tap_reflect

    Reflecting --> Reflected: ai_response
    Reflected --> Saved: dismiss_reflection

    Saved --> Deleted: delete
    WithMood --> Deleted: delete
    Reflected --> Deleted: delete

    Deleted --> [*]

    state Drafting {
        [*] --> FreeForm
        FreeForm --> Prompted: select_prompt
        Prompted --> FreeForm: clear_prompt
    }
```

**Prompt Delivery States:**
```mermaid
stateDiagram-v2
    [*] --> Scheduled

    Scheduled --> Delivered: cadence_trigger
    Delivered --> Seen: user_views
    Seen --> Started: user_taps
    Started --> Completed: entry_saved
    Seen --> Expired: 24h_passed
    Delivered --> Expired: 24h_passed

    Expired --> [*]
    Completed --> [*]

    note right of Scheduled
        Cadence: daily | weekly | off
    end note
```

---

## 4. Feed Item Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: created

    Pending --> Scheduled: approved
    Pending --> Rejected: rejected

    Scheduled --> Active: publish_time
    Active --> Expired: expires_at

    Expired --> [*]
    Rejected --> [*]

    state Active {
        [*] --> Unread
        Unread --> Read: user_views
        Read --> Saved: user_saves
        Saved --> Read: user_unsaves
        Read --> Shared: user_shares
        Saved --> Shared: user_shares
        Shared --> Read: continue
        Read --> ChatLinked: ask_in_chat
        Saved --> ChatLinked: ask_in_chat
        ChatLinked --> Read: return
    }
```

**Feed Item Types:**
```mermaid
stateDiagram-v2
    state FeedItemType {
        Transit: Personal Transit
        Tea: Celebrity/Culture
        Prompt: Reflection Prompt
        Compatibility: Relationship Nudge
    }
```

---

## 5. Tarot Pull Flow

```mermaid
stateDiagram-v2
    [*] --> Ready

    Ready --> Pulling: tap_pull
    Pulling --> Revealing: card_selected
    Revealing --> Revealed: animation_complete

    Revealed --> ChatFollowUp: ask_about_this
    ChatFollowUp --> Revealed: return

    Revealed --> Ready: next_day
    Revealed --> History: view_history

    History --> Ready: back

    state Revealing {
        [*] --> Shuffling
        Shuffling --> Flipping: shuffle_done
        Flipping --> [*]: flip_done
    }
```

**Daily Pull Availability:**
```mermaid
stateDiagram-v2
    [*] --> Available

    Available --> Pulled: user_pulls
    Pulled --> Cooldown: pull_complete

    Cooldown --> Available: midnight_local

    note right of Cooldown
        One pull per day
        Resets at midnight
        local timezone
    end note
```

---

## 6. Relationship Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Adding: add_person

    Adding --> MinimalData: sun_sign_only
    Adding --> FullData: complete_chart

    MinimalData --> FullData: add_more_data
    FullData --> MinimalData: clear_data

    MinimalData --> Active: save
    FullData --> Active: save

    Active --> Active: edit
    Active --> Active: change_label
    Active --> CompatibilityView: view_compatibility

    CompatibilityView --> Active: dismiss
    CompatibilityView --> ChatFollowUp: ask_in_chat
    ChatFollowUp --> Active: return

    Active --> Deleted: delete

    Deleted --> [*]

    state Adding {
        [*] --> SelectType
        SelectType --> EnterName: type_selected
        EnterName --> EnterData: name_entered
    }
```

**Relationship Types:**
```mermaid
stateDiagram-v2
    state RelationshipType {
        Partner: Boyfriend/Partner
        BestFriend: Best Friend
        Situationship: Situationship
        Custom: Custom Label
    }
```

---

## 7. User Session States

```mermaid
stateDiagram-v2
    [*] --> Anonymous

    Anonymous --> Onboarding: launch_first_time
    Onboarding --> Authenticated: complete_onboarding

    Authenticated --> Active: app_open
    Active --> Background: app_background
    Background --> Active: app_foreground

    Active --> LoggedOut: logout
    LoggedOut --> Anonymous: clear_session

    Anonymous --> Authenticated: login_existing

    state Active {
        [*] --> Idle
        Idle --> Chatting: open_chat
        Idle --> Browsing: open_feed
        Idle --> Writing: open_diary
        Idle --> Pulling: open_tarot
        Chatting --> Idle: close
        Browsing --> Idle: close
        Writing --> Idle: close
        Pulling --> Idle: close
    }
```

---

## 8. Memory & Privacy Controls

```mermaid
stateDiagram-v2
    [*] --> DefaultSettings

    DefaultSettings --> Customized: user_changes

    state Customized {
        [*] --> MemoryEnabled
        MemoryEnabled --> MemoryDisabled: toggle_off
        MemoryDisabled --> MemoryEnabled: toggle_on

        --

        [*] --> DiaryAccessOn
        DiaryAccessOn --> DiaryAccessOff: toggle_off
        DiaryAccessOff --> DiaryAccessOn: toggle_on

        --

        [*] --> CloudEnabled
        CloudEnabled --> LocalOnly: toggle_off
        LocalOnly --> CloudEnabled: toggle_on
    }

    Customized --> DataCleared: clear_all_data
    DataCleared --> DefaultSettings: re-onboard
```

**Deletion Cascade:**
```mermaid
stateDiagram-v2
    [*] --> DeleteRequested

    DeleteRequested --> ThreadDelete: delete_thread
    DeleteRequested --> GlobalDelete: delete_all

    ThreadDelete --> ClearMessages: start
    ClearMessages --> ClearMemory: done
    ClearMemory --> ClearCache: done
    ClearCache --> [*]: complete

    GlobalDelete --> ClearAllThreads: start
    ClearAllThreads --> ClearDiary: done
    ClearDiary --> ClearRelationships: done
    ClearRelationships --> ClearTarot: done
    ClearTarot --> ClearFeedSaves: done
    ClearFeedSaves --> ClearProfile: done
    ClearProfile --> [*]: complete
```

---

## 9. AI Response Pipeline

```mermaid
stateDiagram-v2
    [*] --> Received: user_message

    Received --> ContextPacking: start_processing

    state ContextPacking {
        [*] --> LoadChart
        LoadChart --> LoadMemory: done
        LoadMemory --> LoadHistory: done
        LoadHistory --> LoadDiary: if_enabled
        LoadHistory --> Ready: if_disabled
        LoadDiary --> Ready: done
    }

    ContextPacking --> ModelRouting: context_ready

    state ModelRouting {
        [*] --> CheckPlatform
        CheckPlatform --> LocalModel: ios_capable
        CheckPlatform --> CloudModel: web_or_fallback
        LocalModel --> [*]
        CloudModel --> [*]
    }

    ModelRouting --> Generating: model_selected
    Generating --> Streaming: start_stream
    Streaming --> Complete: stream_done
    Complete --> MemoryUpdate: response_saved
    MemoryUpdate --> [*]: done
```

---

## State Legend

| Symbol | Meaning |
|--------|---------|
| `[*]` | Start/End state |
| `-->` | Transition |
| `state { }` | Nested/composite state |
| `: action` | Transition trigger |
| `note` | Additional context |
