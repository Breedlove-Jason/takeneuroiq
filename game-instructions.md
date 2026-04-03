# TakeNeuroIQ Player Instruction Manual v1.1

## Welcome to the Arena

TakeNeuroIQ is a fast-paced cognitive challenge platform built around short sessions, visible performance feedback, and multiple puzzle families. From the Play screen, players choose a challenge arena and enter a timed session designed to test how they think, react, and adapt under pressure. The current playable challenge families are Pattern Rush, Sequence Sprint, Grid Recall, Logic Gate, and Signal Path.

This manual explains exactly how players should approach each mode based on the live arena behavior now present in the project.

---

## How a Session Works

Every challenge session follows the same basic loop:

1. Open the **Play** screen.
2. Choose a challenge arena.
3. The game loads the selected puzzle family into the **Arena**.
4. A **45-second timer** begins.
5. Solve as many puzzles correctly as possible before time expires.
6. Review your end-of-session results and performance insights.

The arena currently supports these puzzle families:

* **Pattern Rush**
* **Sequence Sprint**
* **Grid Recall**
* **Logic Gate**
* **Signal Path**

---

# Core Rules for All Players

## 1. Sessions are timed

Each arena session currently lasts **45 seconds**. When the timer reaches zero, the round ends automatically.

That means every choice is a tradeoff between:

* speed
* accuracy
* rhythm
* pressure control

## 2. Correct answers increase score

Correct answers add points to your score. The current scoring system starts with a **base value of 100 points per correct answer**.

## 3. Streaks increase combo multipliers

As you build a streak, your score multiplier increases.

### Current combo thresholds

* **Streak 0-1** → **x1 combo**
* **Streak 2-3** → **x2 combo**
* **Streak 4-5** → **x3 combo**
* **Streak 6+** → **x4 combo**

This means controlled accuracy is more valuable than random fast clicking. Long streaks multiply scoring power.

## 4. Accuracy matters

Accuracy is based on how many answers you got correct out of the number you attempted.

In general:

* more correct answers with fewer mistakes = stronger session quality
* fast guessing can hurt both accuracy and session evaluation

## 5. Adaptive coaching is active

The arena currently uses a live adaptive state system that responds to your recent performance. During play, the game can present a coaching state such as:

* **Recovery Mode**
* **Stable Load**
* **Challenge Mode**

These states affect live coaching feedback and the target difficulty direction of the session.

---

# Starting a Challenge

From the **Play** page, each arena card includes:

* a mode name
* a short description
* a launch button
* a skill tag group showing the cognitive focus of that mode

These are the current mode themes:

## Pattern Rush

**Focus:** Pattern Recognition, Visual Processing

## Sequence Sprint

**Focus:** Working Memory, Predictive Reasoning

## Grid Recall

**Focus:** Spatial Memory, Attention

## Logic Gate

**Focus:** Reasoning, Signals, Binary Logic

## Signal Path

**Focus:** Planning, Routing, Constraint Logic

---

# Puzzle Family Instructions

## Pattern Rush

### What the player sees

Pattern Rush presents a visual pattern grid with one missing tile. The player must determine which answer choice correctly completes the pattern.

The arena labels this as a missing-tile style challenge where the goal is to **resolve the missing tile and keep momentum alive**.

### How to play

1. Study the visible pattern before clicking.
2. Identify the rule governing the sequence.
3. Compare the answer tray options carefully.
4. Select the tile that completes the visual logic.

### What this mode trains

* pattern recognition
* visual sequencing
* rule detection
* rapid decision making under pressure

### Beginner advice

Do not choose the option that merely looks similar. Choose the one that fits the structural rule.

### Best strategy

Ask yourself:

**What changes from tile to tile?**

Once you identify the rule, the missing answer becomes much easier to isolate.

---

## Sequence Sprint

### What the player sees

Sequence Sprint presents a sequence prompt and a set of possible answers. The player must determine what comes next in the sequence.

The arena language for this mode is:

* **Read the logic. Finish the lane.**
* **Track the pattern**
* **Select the next match**

The mode also includes a visible momentum lane with a runner that advances as progress increases.

### How to play

1. Read the full sequence before choosing.
2. Identify whether it is repeating, alternating, increasing, or shifting.
3. Select the next correct value from the answer lane.
4. Continue solving until time expires.

### What this mode trains

* working memory
* predictive reasoning
* sequence recognition
* momentum under time pressure

### Important behavior in this mode

Sequence Sprint tracks solved progress against the total available sequence puzzles. It also has an overflow combo behavior after visible progress is capped, which means continued success past the visible lane still matters for scoring and combo presentation.

### Beginner advice

Do not solve only the first half of the pattern and guess. Harder sequences often hide the real rule later in the chain.

### Best strategy

Mentally test your rule across the entire visible sequence before selecting an answer.

---

## Grid Recall

### What the player sees

Grid Recall has two phases:

* **Memorization Phase**
* **Recall Phase**

A visual grid is shown briefly during memorization. Then the player must choose the matching grid from multiple answer options.

The current arena flow switches from memorize to recall automatically, and the memorize display is intentionally brief.

### How to play

1. During the memorization phase, study the active pattern.
2. Do not try to memorize each square separately.
3. Encode the pattern as a shape, cluster, or structure.
4. During the recall phase, select the option that matches the original grid.

### What this mode trains

* spatial memory
* short-term visual recall
* attention control
* pattern retention under pressure

### Beginner advice

Your memory improves when you remember the board as one shape instead of a list of separate boxes.

### Best strategy

Use mental chunking. Think in shapes such as:

* corner cluster
* center block
* diagonal chain
* L-shape

---

## Logic Gate

### What the player sees

Logic Gate presents a binary reasoning puzzle built around signal inputs, a gate core, and answer options.

The arena describes this mode as:

* **Resolve the signal. Predict the output.**
* **Binary Reasoning Live**

This mode can currently present multiple puzzle variants, including:

* **Output**
* **Missing Gate**
* **Missing Signal**

### How to play

1. Read the binary inputs.
2. Study the gate or expression shown in the core.
3. Determine the correct output, missing gate, or missing signal depending on the puzzle variant.
4. Select the correct answer from the answer panel.

### What this mode trains

* binary logic
* symbolic reasoning
* rule application
* signal interpretation

### Beginner advice

Move slowly enough to understand the relationship between the inputs and the gate. Logic Gate rewards reasoning, not reflex clicking.

### Best strategy

Translate the puzzle into a simple internal question:

* What should this gate produce?
* What gate would make this output true?
* Which signal is missing from the circuit?

---

## Signal Path

### What the player sees

Signal Path presents a routing challenge based on a rule, a node network, and candidate routes. The player must choose the path that satisfies the signal constraint.

The arena describes this mode as:

* **Route the signal. Obey the rule.**
* **Constraint Logic Live**

The player can see:

* the routing rule
* the signal network
* candidate routes
* the route selection panel

### How to play

1. Read the routing rule carefully.
2. Inspect the nodes and their values.
3. Review the candidate paths.
4. Select the path that correctly satisfies the current rule.

### What this mode trains

* planning
* route evaluation
* constraint-based reasoning
* signal path analysis

### Beginner advice

Do not select the path that looks shortest or simplest unless it actually satisfies the rule.

### Best strategy

Check every route against the rule directly. Treat the problem like a logic filter, not a visual guess.

---

# Live Session Feedback

During the session, the player may see live feedback such as:

* correct response messages
* incorrect response messages
* live coaching prompts
* adaptive shift notices
* current cognitive state
* current and target difficulty labels

These help the player understand not just whether they are right or wrong, but how the system is interpreting their overall performance.

### Current live coaching states

* **Recovery Mode**: focus on accuracy over speed
* **Stable Load**: maintain rhythm and consistency
* **Challenge Mode**: strong momentum, push harder

---

# Understanding the HUD

The arena currently shows several live metrics:

## Score

Your running point total.

## Streak

Your current chain of consecutive correct answers.

## Combo

Your current score multiplier based on streak level.

## Accuracy

Your current percentage of correct answers out of attempted answers.

## Cognitive State

The live adaptive state, confidence indicator, and target difficulty direction.

## Time Remaining

How many seconds remain in the 45-second session.

---

# End of Session Results

When time expires, the game displays a results screen. That screen currently includes mode-specific messaging and session stats such as:

* final score
* best streak
* accuracy
* session insight
* cognitive identity
* training direction
* next recommended difficulty

Some modes also use custom end-of-round language.

### Example result categories already supported

* strong performance
* partial progress
* timed out
* stable recognition
* spatial accuracy
* signal control
* reasoning improvement

The system can also evaluate the player session outcome and classify a cognitive identity based on performance data captured during the run.

---

# Recommended Session System

The arena also supports recommended sessions. If a player arrives through an adaptive recommendation, the game may display:

* a recommended session banner
* an opening difficulty recommendation
* a reason for the recommendation
* an alignment state showing whether the player stayed aligned with the recommended training state

This is part of the larger adaptive coaching loop.

---

# How Players Should Improve

## 1. Learn the puzzle family before chasing score

Every mode has its own logic language. Early progress should focus on understanding the challenge style.

## 2. Protect your streaks

Because score multiplies with streaks, a steady accurate session usually beats chaotic fast guessing.

## 3. Use feedback as training information

The live coaching bar and end-of-session summaries are meant to guide improvement. Read them.

## 4. Improve one mode at a time

The fastest way to level up is to specialize briefly, then broaden.

## 5. Treat mistakes as signal, not failure

Each miss tells you something:

* you rushed
* you misread a rule
* you lost focus
* you guessed too early

That is useful data.

---

# Quick Start Version for Players

If you only remember five things, remember these:

1. Every round is **45 seconds**.
2. Correct answers start at **100 points**.
3. Combos increase with streaks: **x2 at 2+, x3 at 4+, x4 at 6+**.
4. Accuracy matters just as much as speed.
5. Every mode tests a different cognitive skill, so adjust your strategy to the challenge.

---

# Current Mode Summary

## Pattern Rush

Complete the missing visual tile.

## Sequence Sprint

Find the next item in the sequence.

## Grid Recall

Memorize a grid, then select the correct match.

## Logic Gate

Resolve binary logic through gates and signals.

## Signal Path

Choose the correct route through a constrained signal network.

---

# Future Additions for This Manual

As TakeNeuroIQ grows, this manual should expand to include:

* illustrated examples for every puzzle family
* exact logic gate tutorial examples
* signal path walkthroughs
* combo math examples
* difficulty scaling details
* adaptive coaching explanation for players
* glossary of performance metrics
* team mode instructions
* rewards and progression systems
* accessibility and onboarding help

---

This version is now aligned to the currently uploaded Play and Arena code and should serve as the base manual we build on from here.
