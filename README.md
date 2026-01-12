# NexArt Protocol

**Status:** Active · Production  
**Current Version:** v1.2.0  
**SDK Version:** @nexart/codemode-sdk v1.6.0  
**Canonical Docs:** https://nexart.io  
**Reference App:** https://nexart.xyz

---

## What Is NexArt?

NexArt is an open protocol for generative and sound-driven art systems.

It defines what a generative system is, how it is represented, validated, versioned, and reproduced — independently of any single application, renderer, or interface.

> Applications may change.  
> Standards must persist.

NexArt separates systems from outputs, enabling generative artworks to remain reproducible, verifiable, and portable over time.

---

## Protocol vs Application

NexArt consists of two distinct layers:

### Protocol Layer (this repository documents)

- Canonical system schemas
- Determinism and reproducibility guarantees
- Validation and enforcement rules
- Versioning and backward compatibility
- Long-term portability

### Application Layer

- Creator-facing tools
- Editors and interfaces
- Rendering implementations
- Publishing and minting UX

The primary reference application is nexart.xyz, but the protocol is designed to support multiple future implementations.

---

## Current Protocol Status (v1.2.0)

Enforcement is incremental and mode-specific.

### Hard-Enforced (Production)

- **Code Mode**
- **SoundArt**
- **Shapes**
- **Noise**
- **Artnames**

These systems are fully validated and governed by the protocol. Invalid systems are rejected. All hard-enforced modes are executed exclusively via the NexArt Code Mode runtime with no Canvas2D or legacy rendering paths.

### Experimental / Non-Protocol

- **Fluids**

Fluids remains non-protocol and provides no reproducibility guarantees.

---

## Code Mode Status

### Code Mode v1.x (Current)

- Protocol-stable, production-ready
- Deterministic execution via @nexart/codemode-sdk v1.6.0
- Fully governed by Protocol v1.2.0
- Renderer-agnostic, statically validatable
- Versioned and portable

**Current:**  
Code Mode is production-stable under Protocol v1.2.0.  
All execution is deterministic and verified.

See: *Code Mode Creator's Guide* in the documentation.

---

## Determinism & Guarantees

The NexArt Protocol makes explicit, bounded guarantees:

- Deterministic systems produce the same output for the same inputs
- Best-effort systems may vary across renderers and hardware
- Backward compatibility is preserved once a schema is frozen
- New capabilities require new protocol versions

Perfect pixel-level identity across all environments is not claimed where hardware variance applies.

---

## Governance & Evolution

The protocol evolves via:

- Engineering-led stewardship
- Incremental enforcement
- Explicit non-goals
- Conservative versioning

NexArt is not currently governed by a DAO.  
Token-based governance may be considered in the future, but is not assumed.

---

## Canonical Sources of Truth

- **Human-readable documentation:** https://nexart.io
- **Reference implementation:** https://nexart.xyz
- **This repository:** Canonical public mirror of the protocol documentation

If a conflict exists, nexart.io is authoritative.

---

## Non-Goals

The NexArt Protocol is **not**:

- A general-purpose programming language
- A standalone rendering service
- A DAO or token-governed system (at present)
- A finished or static specification
- A replacement for existing generative art platforms

These boundaries are intentional.

---

## License

This repository is licensed under the [Apache License 2.0](LICENSE).

---

> **NexArt defines systems — not just images.**
