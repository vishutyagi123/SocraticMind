# 🧠 CognitiveInt × SocraticMind

> *From answers to thinking — an AI system that maps, fixes, and evolves how students reason for real-world interviews.*

---

## 🚨 The Problem

If you’ve ever prepared for placements, you already know the loop:

* Solve questions
* Give mock interviews
* Get a score
* Repeat

But here’s the catch:

> ❌ No one tells you **why your thinking breaks**
> ❌ No system adapts to the **actual Job Description (JD)**
> ❌ Feedback never turns into **real learning**

Most tools evaluate answers.
**We evaluate reasoning.**

---

## 💡 What We Built

CognitiveInt × SocraticMind is a **dual-engine AI system** that continuously improves how a student thinks.

### 🔁 Core Loop

```
Diagnose → Teach → Validate → Repeat
```

---

## ⚙️ System Overview

### 🧪 CognitiveInt — *Interview Engine*

Simulates a **real interviewer**, not a question bank.

* Runs a **4-agent pipeline**:

  ```
  Transcriber → Verifier → Profiler → Strategist
  ```

* Builds a live **Reasoning Fingerprint**:

  * Conceptual Depth
  * Accuracy
  * Confidence
  * Consistency

* Parses **Job Description (JD)** → ensures topic alignment

* Detects weak areas and probes intelligently

* Supports **voice + text interaction**

---

### 🧠 SocraticMind — *Learning Engine*

Doesn't give answers. Forces understanding.

* Takes the **Reasoning Fingerprint** directly (no re-diagnosis)

* Teaches using:

  * Questions
  * Analogies
  * Counter-examples

* Uses:

  * **DistilBERT** → detects real understanding vs fake “got it”
  * **Contextual Bandit RL** → adapts teaching strategy

* Once mastery is detected → sends you back for re-interview

---

## 🧬 The Real Innovation

### 🔍 Reasoning Fingerprint

A dynamic cognitive profile that evolves after every answer.

Unlike scores, it answers:

* *Are you guessing or actually understanding?*
* *Are you consistent under pressure?*
* *Are you confident but wrong?*

---

## 🔄 Workflow

```
Upload JD → Extract Topics

CognitiveInt:
Answer → Transcribe → Verify → Profile → Strategize
         ↓
   Reasoning Fingerprint + Weak Spots

SocraticMind:
Teach → Adapt → Detect Understanding
         ↓
     Mastery?

YES → Re-interview  
NO  → Change strategy
```


## System Architecture

<p align="center">
  <img src="./assets/cognitiveint_socraticmind_system_design.svg" width="900"/>
</p>
---

## 🛠️ Tech Stack

| Layer       | Tech Used                   |
| ----------- | --------------------------- |
| Frontend    | React + Tailwind + Recharts |
| Backend     | Flask (Python)              |
| AI Agents   | Claude API                  |
| Voice       | Web Speech API (STT + TTS)  |
| NLP         | DistilBERT (fine-tuned)     |
| RL Layer    | Contextual Bandit           |
| PDF Parsing | PyMuPDF                     |

---

## 🎥 Demo

👉 https://youtu.be/qjmvTvoc8v4

(*Full walkthrough of the system loop*)

---

## 🎯 Who Is This For?

* 🎓 Engineering students preparing for placements
* 🏫 Bootcamps & training institutes
* 💼 Placement platforms (B2B use case)

---

## 🧩 Why This Is Different

Most platforms:

> “Here’s your score.”

We say:

> “Here’s how your thinking is broken — and let’s fix it.”

---

## 📈 Future Scope

* Company-specific interview prep (JD + real data)
* Peer benchmarking using reasoning fingerprints
* Full RL-based personalized teaching
* Mobile-first Socratic learning
* B2B analytics for placement cells

---

## 🚀 Final Thought

This isn’t another mock interview platform.

It’s a system that **learns how you think — and then improves it.**
