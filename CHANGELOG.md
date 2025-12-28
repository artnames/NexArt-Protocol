# Changelog

All notable changes to the NexArt Protocol are documented in this file.

---

## v0.4 — Production

### Hard Enforcement

- **Code Mode**: Full validation and enforcement active. Invalid systems are rejected.
- **SoundArt**: Full validation and enforcement active. Executed via NexArt Code Mode runtime with frozen audio snapshots.
- **Shapes**: Full validation and enforcement active. Rendered via NexArt Code Mode runtime.
- **Noise**: Full validation and enforcement active. Rendered via NexArt Code Mode runtime.
- **Artnames**: Full validation and enforcement active. Invalid systems are rejected.

All hard-enforced modes are executed exclusively via the NexArt Code Mode runtime. There are no Canvas2D or legacy rendering paths.

### Schema

- Canonical schema frozen for hard-enforced modes.
- Backward compatibility guaranteed for frozen schemas.

### Experimental

- Fluids remains non-protocol and provides no reproducibility guarantees.

---

## v0.3 and Earlier

Prior versions were internal development milestones. No public guarantees apply.
