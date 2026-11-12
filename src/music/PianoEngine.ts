import type { Score, ScoreEvent } from './model'

type ActiveVoice = { oscillators: OscillatorNode[]; gains: GainNode[] }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Lightweight additive piano prototype.
 * It is intentionally an offline-friendly Web Audio instrument layer, not a
 * claim of sampled acoustic-piano realism. A multisample bank can replace it
 * later without changing the Score transport contract.
 */
export class MeloPianoEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private voices: ActiveVoice[] = []
  private startedAt = 0
  private duration = 0
  private stopped = true

  private ensureContext(): AudioContext {
    if (!this.context || this.context.state === 'closed') {
      const AudioContextClass = window.AudioContext
      this.context = new AudioContextClass()
      this.master = this.context.createGain()
      this.master.gain.value = 0.22
      this.master.connect(this.context.destination)
    }
    return this.context
  }

  async play(score: Score, bpm: number, volume = 0.8): Promise<void> {
    this.stop()
    const context = this.ensureContext()
    if (context.state === 'suspended') await context.resume()
    this.stopped = false
    this.master!.gain.setTargetAtTime(clamp(volume, 0, 1) * 0.28, context.currentTime, 0.025)

    const quarterSeconds = 60 / clamp(bpm, 30, 240)
    const events = score.parts.flatMap(part => part.measures.flatMap(measure => {
      const measureOffset = part.measures.slice(0, part.measures.indexOf(measure))
        .reduce((sum, item) => sum + Math.max(0, ...item.events.map(event => event.onset + event.duration)), 0)
      return measure.events.map(event => ({ event, at: measureOffset + event.onset }))
    })).filter(item => item.event.kind === 'note' && item.event.pitch)

    this.duration = Math.max(0, ...events.map(item => (item.at + item.event.duration) * quarterSeconds))
    this.startedAt = context.currentTime
    const startTime = context.currentTime + 0.08

    for (const item of events) {
      const event = item.event as ScoreEvent
      if (!event.pitch) continue
      const at = startTime + item.at * quarterSeconds
      const noteDuration = Math.max(0.06, event.duration * quarterSeconds)
      this.scheduleNote(context, event, at, noteDuration)
    }
  }

  private scheduleNote(context: AudioContext, event: ScoreEvent, at: number, duration: number) {
    if (!this.master || !event.pitch) return
    const frequency = 440 * Math.pow(2, (event.pitch.midi - 69) / 12)
    const velocity = clamp((event.velocity ?? 88) / 127, 0.08, 1)
    const partials = [
      { ratio: 1, level: 1 },
      { ratio: 2.001, level: 0.34 },
      { ratio: 3.003, level: 0.14 },
      { ratio: 4.006, level: 0.065 },
      { ratio: 5.01, level: 0.025 },
    ]
    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []

    for (const partial of partials) {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const filter = context.createBiquadFilter()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency * partial.ratio, at)
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(clamp(9000 - Math.max(0, frequency - 440) * 5, 1800, 9000), at)
      const peak = velocity * partial.level * (partial.ratio === 1 ? 0.72 : 0.42)
      const decay = 0.45 + Math.min(1.8, duration * 0.42)
      envelope.gain.setValueAtTime(0.0001, at)
      envelope.gain.linearRampToValueAtTime(Math.max(0.0002, peak), at + 0.008)
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.00012, peak * 0.28), at + decay)
      envelope.gain.setTargetAtTime(0.0001, at + Math.max(0.09, duration), 0.24)
      oscillator.connect(filter)
      filter.connect(envelope)
      envelope.connect(this.master)
      oscillator.start(at)
      oscillator.stop(at + Math.max(duration + 1.1, decay + 0.8))
      oscillators.push(oscillator)
      gains.push(envelope)
    }
    this.voices.push({ oscillators, gains })
  }

  pause(): Promise<void> {
    return this.context?.state === 'running' ? this.context.suspend() : Promise.resolve()
  }

  resume(): Promise<void> {
    return this.context?.state === 'suspended' ? this.context.resume() : Promise.resolve()
  }

  get position(): number {
    if (!this.context || this.stopped) return 0
    return clamp(this.context.currentTime - this.startedAt, 0, this.duration)
  }

  get totalDuration(): number {
    return this.duration
  }

  get isPaused(): boolean {
    return this.context?.state === 'suspended'
  }

  stop() {
    this.stopped = true
    if (this.context && this.context.state !== 'closed') {
      const now = this.context.currentTime
      for (const voice of this.voices) {
        for (const gain of voice.gains) {
          try {
            gain.gain.cancelScheduledValues(now)
            gain.gain.setTargetAtTime(0.0001, now, 0.012)
          } catch { /* A voice may already have ended. */ }
        }
        for (const oscillator of voice.oscillators) {
          try { oscillator.stop(now + 0.06) } catch { /* Already stopped. */ }
        }
      }
    }
    this.voices = []
    this.duration = 0
  }

  async dispose() {
    this.stop()
    if (this.context && this.context.state !== 'closed') await this.context.close()
    this.context = null
    this.master = null
  }
}
