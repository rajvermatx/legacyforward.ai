"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* ─── Fonts ─── */
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf", fontWeight: 700 },
  ],
});

/* ─── Colors ─── */
const C = {
  navy: "#0f172a",
  navyLight: "#1e293b",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  white: "#ffffff",
  teal: "#14b8a6",
  tealDark: "#0d9488",
  tealLight: "#ccfbf1",
  blue: "#3b82f6",
  blueDark: "#1d4ed8",
  blueLight: "#dbeafe",
  violet: "#8b5cf6",
  violetDark: "#6d28d9",
  violetLight: "#ede9fe",
  amber: "#f59e0b",
  amberDark: "#b45309",
  amberLight: "#fef3c7",
  red: "#ef4444",
  redLight: "#fef2f2",
  emerald: "#10b981",
};

/* ─── Base styles ─── */
const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 8,
    color: C.slate700,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 36,
  },
  /* Header / Footer */
  header: {
    position: "absolute",
    top: 16,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingBottom: 6,
  },
  headerBrand: { fontSize: 10, fontWeight: 700, color: C.navy },
  headerBrandAccent: { color: C.teal },
  headerRight: { fontSize: 7, color: C.slate400 },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: C.slate400 },
  /* Section containers */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  sectionBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionBadgeText: { fontSize: 8, fontWeight: 700, color: C.white },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: C.white },
  sectionSub: { fontSize: 7, color: "rgba(255,255,255,0.7)" },
  sectionBody: {
    backgroundColor: C.white,
    padding: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  /* Cards */
  cardRow: { flexDirection: "row", gap: 6 },
  card: {
    flex: 1,
    borderRadius: 5,
    padding: 8,
    borderWidth: 1,
  },
  cardNumRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  cardNum: {
    width: 14,
    height: 14,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  cardNumText: { fontSize: 7, fontWeight: 700, color: C.white },
  cardTitle: { fontSize: 8, fontWeight: 700, color: C.navy },
  cardDesc: { fontSize: 7, color: C.slate500, marginBottom: 5, lineHeight: 1.4 },
  gateBox: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 3 },
  gateText: { fontSize: 6.5, fontWeight: 600 },
  /* Tables */
  table: { borderWidth: 1, borderColor: C.slate200, borderRadius: 5, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: C.slate50 },
  tableHeaderCell: { paddingHorizontal: 8, paddingVertical: 5, fontWeight: 600, fontSize: 7.5, color: C.navy },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.slate100 },
  tableCell: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 7, lineHeight: 1.4 },
  tableCellLabel: { fontWeight: 600, color: C.navy },
  /* Two-column panels */
  twoCol: { flexDirection: "row", gap: 8 },
  panel: { flex: 1, borderRadius: 5, padding: 8, borderWidth: 1 },
  panelTitle: { fontSize: 8, fontWeight: 700, color: C.navy, marginBottom: 5 },
  listItem: { flexDirection: "row", gap: 3, marginBottom: 3 },
  bullet: { fontSize: 7, marginTop: 0.5 },
  listText: { fontSize: 7, lineHeight: 1.4, flex: 1 },
  bold: { fontWeight: 700 },
  /* Connections */
  connBox: { flex: 1, paddingLeft: 8, borderLeftWidth: 3 },
  connTitle: { fontSize: 8, fontWeight: 700, color: C.navy, marginBottom: 4 },
  connItem: { fontSize: 6.5, color: C.slate500, marginBottom: 2, lineHeight: 1.4 },
  /* Dark box */
  darkBox: { backgroundColor: C.navy, borderRadius: 6, overflow: "hidden" },
  darkBoxHeader: { paddingHorizontal: 12, paddingVertical: 6 },
  darkBoxTitle: { fontSize: 9, fontWeight: 700, color: C.white },
  darkBoxSub: { fontSize: 6.5, color: C.slate400 },
  darkBoxBody: { backgroundColor: C.white, padding: 10 },
  /* Principles */
  principleRow: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginBottom: 4 },
  principleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  principleText: { fontSize: 7.5, lineHeight: 1.4, flex: 1 },
});

/* ─── Reusable Header / Footer ─── */
function Header({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={s.header} fixed>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={s.headerBrand}>
          Legacy<Text style={s.headerBrandAccent}>Forward</Text>
        </Text>
        <View style={{ backgroundColor: C.teal, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1.5 }}>
          <Text style={{ fontSize: 7, fontWeight: 700, color: C.white }}>AI</Text>
        </View>
        <Text style={{ fontWeight: 400, color: C.slate400, fontSize: 8 }}>Framework Cheatsheet</Text>
      </View>
      <Text style={s.headerRight}>{pageLabel}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>legacyforward.ai</Text>
      <Text style={{ fontSize: 5.5, color: C.slate400, maxWidth: 420, textAlign: "center" }}>
        For informational purposes only. No warranty expressed or implied. All opinions are the author&apos;s own. legacyforward.ai/about
      </Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

/* ─── Gate badge ─── */
function Gate({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={[s.gateBox, { backgroundColor: bg, borderWidth: 1, borderColor: fg + "33" }]}>
      <Text style={[s.gateText, { color: fg }]}>GATE: {text}</Text>
    </View>
  );
}

function GateShort({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={[s.gateBox, { backgroundColor: bg, borderWidth: 1, borderColor: fg + "33", alignSelf: "stretch", marginTop: "auto" }]}>
      <Text style={[s.gateText, { color: fg, textAlign: "center" }]}>{text}</Text>
    </View>
  );
}

/* ─── Anti-pattern item ─── */
function Anti({ name, desc }: { name: string; desc: string }) {
  return (
    <View style={s.listItem}>
      <Text style={[s.listText]}>
        <Text style={{ fontWeight: 700, color: C.red }}>{name}</Text>
        {" — "}{desc}
      </Text>
    </View>
  );
}

/* ─── Question item ─── */
function Q({ text, color }: { text: string; color: string }) {
  return (
    <View style={s.listItem}>
      <Text style={[s.bullet, { color }]}>{"\u203A"}</Text>
      <Text style={s.listText}>{text}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════ */
/* PDF Document                           */
/* ═══════════════════════════════════════ */
export default function CheatsheetPDF() {
  return (
    <Document title="LegacyForward Framework Cheatsheet" author="LegacyForward">

      {/* ═══ PAGE 1: Decision Aid + Signal Capture ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <Header pageLabel="Signal Capture" />
        <Footer />

        {/* Decision Aid */}
        <View style={[s.darkBox, { marginBottom: 10 }]}>
          <View style={s.darkBoxHeader}>
            <Text style={s.darkBoxTitle}>Where to Start</Text>
          </View>
          <View style={[s.darkBoxBody, { flexDirection: "row" }]}>
            {[
              { q: "\u201CWe have AI ideas but don\u2019t know which are worth it.\u201D", a: "Signal Capture \u2192", color: C.teal },
              { q: "\u201COur AI projects stall or deliver inconsistent results.\u201D", a: "Grounded Delivery \u2192", color: C.blue },
              { q: "\u201CWe can\u2019t replace legacy systems but need AI to work with them.\u201D", a: "Legacy Coexistence \u2192", color: C.violet },
            ].map((d, i) => (
              <View key={i} style={{ flex: 1, paddingHorizontal: 10, borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: C.slate200 }}>
                <Text style={{ fontSize: 7, color: C.slate500, marginBottom: 4 }}>{d.q}</Text>
                <Text style={{ fontSize: 8, fontWeight: 700, color: d.color }}>{d.a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Signal Capture section */}
        <View style={{ borderWidth: 1, borderColor: C.tealLight, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          <View style={[s.sectionHeader, { backgroundColor: C.tealDark }]}>
            <View style={s.sectionBadge}><Text style={s.sectionBadgeText}>1</Text></View>
            <View>
              <Text style={s.sectionTitle}>Signal Capture</Text>
              <Text style={s.sectionSub}>Identify where AI creates value impossible by other means</Text>
            </View>
          </View>
          <View style={[s.sectionBody, { borderColor: C.tealLight }]}>
            <View style={s.cardRow}>
              {[
                { num: "1", name: "Value Hypothesis", desc: "Articulate where AI creates net new value before any technical work", gate: "Clear, measurable, worth pursuing; deterministic alternatives ruled out" },
                { num: "2", name: "Value Validation", desc: "Validate across data, feasibility, organizational, and economic dimensions", gate: "All four pass \u2014 data, feasibility, adoption, economics" },
                { num: "3", name: "Value Tracking", desc: "Measure value continuously in production with leading/lagging indicators", gate: "Thresholds trigger review or kill if progress stalls" },
              ].map((st) => (
                <View key={st.num} style={[s.card, { borderColor: C.tealLight, backgroundColor: C.tealLight + "40" }]}>
                  <View style={s.cardNumRow}>
                    <View style={[s.cardNum, { backgroundColor: C.teal }]}><Text style={s.cardNumText}>{st.num}</Text></View>
                    <Text style={s.cardTitle}>{st.name}</Text>
                  </View>
                  <Text style={s.cardDesc}>{st.desc}</Text>
                  <Gate text={st.gate} bg={C.amberLight} fg={C.amberDark} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Key Questions + Anti-Patterns */}
        <View style={s.twoCol}>
          <View style={[s.panel, { borderColor: C.tealLight, backgroundColor: C.tealLight + "20" }]}>
            <Text style={s.panelTitle}>{"\u25C6"} Key Questions</Text>
            <Q color={C.teal} text="Where does this create net new value we cannot achieve any other way?" />
            <Q color={C.teal} text="Remove the AI and use unlimited human effort \u2014 could we achieve the same result?" />
            <Q color={C.teal} text="What is success in operational terms \u2014 revenue, cost, risk, time-to-insight \u2014 with targets?" />
            <Q color={C.teal} text="Does the required data actually exist, and is it accessible?" />
            <Q color={C.teal} text="Will the organization trust and actually use the output?" />
            <Q color={C.teal} text="Does the value justify the full cost \u2014 development, integration, governance, monitoring, retraining?" />
          </View>
          <View style={[s.panel, { borderColor: C.red + "33", backgroundColor: C.redLight + "80" }]}>
            <Text style={s.panelTitle}>{"\u26A0"} Anti-Patterns</Text>
            <Anti name="The Adoption Trap" desc="Measuring success by deployment volume instead of value delivered" />
            <Anti name="Solutions Looking for Problems" desc='Starting with "we need an AI strategy" instead of a problem only AI can solve' />
            <Anti name="Automation as Transformation" desc="Making a broken process faster is not transformation" />
            <Anti name="The Vibe-Coded Commitment" desc="AI builds demo in days; leadership commits before validating value" />
            <Anti name="The Perpetual Pilot" desc='Initiatives in "pilot" indefinitely. Every pilot needs a kill date.' />
            <Anti name="The Sunk Cost Spiral" desc="Continuing to fund initiatives that have failed to demonstrate value" />
          </View>
        </View>
      </Page>

      {/* ═══ PAGE 2: Grounded Delivery ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <Header pageLabel="Grounded Delivery" />
        <Footer />

        <View style={{ borderWidth: 1, borderColor: C.blueLight, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          <View style={[s.sectionHeader, { backgroundColor: C.blueDark }]}>
            <View style={s.sectionBadge}><Text style={s.sectionBadgeText}>2</Text></View>
            <View>
              <Text style={s.sectionTitle}>Grounded Delivery</Text>
              <Text style={s.sectionSub}>Deliver AI through phases designed for non-deterministic systems</Text>
            </View>
          </View>
          <View style={[s.sectionBody, { borderColor: C.blueLight }]}>
            <View style={s.cardRow}>
              {[
                { num: "1", name: "Frame", desc: "Value hypothesis, boundaries, probabilistic success criteria, governance model", gate: "GO / NO-GO" },
                { num: "2", name: "Explore", desc: "Structured experiments, parallel approaches, build evaluation dataset", gate: "GO / PIVOT / KILL" },
                { num: "3", name: "Shape", desc: "Production architecture, integration contracts, fallback paths, ops model", gate: "GO / REVISIT" },
                { num: "4", name: "Harden", desc: "Production code, eval suite, adversarial testing, human evaluation", gate: "GO / ITERATE" },
                { num: "5", name: "Operate", desc: "Deploy, monitor drift, collect feedback, retrain/re-prompt continuously", gate: "ONGOING" },
              ].map((ph) => (
                <View key={ph.num} style={[s.card, { borderColor: C.blueLight, backgroundColor: C.blueLight + "40" }]}>
                  <View style={s.cardNumRow}>
                    <View style={[s.cardNum, { backgroundColor: C.blue }]}><Text style={s.cardNumText}>{ph.num}</Text></View>
                    <Text style={s.cardTitle}>{ph.name}</Text>
                  </View>
                  <Text style={s.cardDesc}>{ph.desc}</Text>
                  <GateShort text={ph.gate} bg={C.amberLight} fg={C.amberDark} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Key Questions + Anti-Patterns */}
        <View style={s.twoCol}>
          <View style={[s.panel, { borderColor: C.blueLight, backgroundColor: C.blueLight + "20" }]}>
            <Text style={s.panelTitle}>{"\u25C6"} Key Questions by Phase</Text>
            <View style={s.listItem}><Text style={s.listText}><Text style={{ fontWeight: 700, color: C.blueDark }}>Frame:</Text> Does the problem genuinely require non-deterministic components? What does &quot;good enough&quot; look like in probabilistic terms?</Text></View>
            <View style={s.listItem}><Text style={s.listText}><Text style={{ fontWeight: 700, color: C.blueDark }}>Explore:</Text> What explicit hypothesis are we testing? How will we evaluate? What is the kill criterion?</Text></View>
            <View style={s.listItem}><Text style={s.listText}><Text style={{ fontWeight: 700, color: C.blueDark }}>Shape:</Text> Where is the boundary between deterministic and non-deterministic components? What are our fallback paths?</Text></View>
            <View style={s.listItem}><Text style={s.listText}><Text style={{ fontWeight: 700, color: C.blueDark }}>Harden:</Text> Does production eval meet probabilistic criteria with statistical confidence? Adversarial vectors tested?</Text></View>
            <View style={s.listItem}><Text style={s.listText}><Text style={{ fontWeight: 700, color: C.blueDark }}>Operate:</Text> How do we detect model/data/concept drift? Is the eval dataset a living artifact updated from production?</Text></View>
          </View>
          <View style={[s.panel, { borderColor: C.red + "33", backgroundColor: C.redLight + "80" }]}>
            <Text style={s.panelTitle}>{"\u26A0"} Anti-Patterns</Text>
            <Anti name="Frame Skipped" desc='Team wants to "start building" without defining probabilistic success criteria' />
            <Anti name="Velocity as Progress" desc="Code production throughput is not the bottleneck; evaluation throughput is" />
            <Anti name="Test Generation Illusion" desc="AI-generated tests asserting on specific strings provide false confidence" />
            <Anti name="Sunk Cost at Gates" desc="Evidence shows marginal approach, but team pushes forward due to time invested" />
            <Anti name="Ship and Forget" desc="Deploying without budget for ongoing evaluation, monitoring, and retraining" />
          </View>
        </View>

        {/* Agile vs Grounded Delivery table */}
        <View style={[s.table, { marginTop: 8 }]}>
          <View style={[s.tableHeader, { backgroundColor: C.blueDark, borderTopLeftRadius: 5, borderTopRightRadius: 5 }]}>
            <View style={{ width: 100 }}><Text style={[s.tableHeaderCell, { color: C.white }]}>Construct</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.tableHeaderCell, { color: C.white }]}>Agile (Deterministic)</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.tableHeaderCell, { color: C.white }]}>Grounded Delivery (Non-Deterministic)</Text></View>
          </View>
          {[
            ["Work Unit", "User Story", "Value Hypothesis"],
            ["Success", "Binary pass/fail acceptance criteria", "Probabilistic thresholds (e.g., 92% acceptable \u00B13%)"],
            ["Planning", "Estimate in story points, commit to scope", "Time-box investigation, go/no-go on evidence"],
            ["Testing", "Regression (what passed yesterday passes today)", "Continuous evaluation (quality distribution shifts)"],
            ["Done", "Feature meets spec", "Quality exceeds threshold with statistical confidence"],
            ["Experimentation", "Spikes \u2014 second-class, grudgingly tolerated", "Full phase (Explore) with artifacts and funding"],
            ["Post-Deploy", "Ship and stabilize", "Permanent investment in evaluation and retraining"],
          ].map((row, i) => (
            <View key={i} style={s.tableRow}>
              <View style={{ width: 100 }}><Text style={[s.tableCell, s.tableCellLabel]}>{row[0]}</Text></View>
              <View style={{ flex: 1 }}><Text style={s.tableCell}>{row[1]}</Text></View>
              <View style={{ flex: 1 }}><Text style={[s.tableCell, { color: C.blueDark, fontWeight: 600 }]}>{row[2]}</Text></View>
            </View>
          ))}
        </View>
      </Page>

      {/* ═══ PAGE 3: Legacy Coexistence ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <Header pageLabel="Legacy Coexistence" />
        <Footer />

        <View style={{ borderWidth: 1, borderColor: C.violetLight, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
          <View style={[s.sectionHeader, { backgroundColor: C.violetDark }]}>
            <View style={s.sectionBadge}><Text style={s.sectionBadgeText}>3</Text></View>
            <View>
              <Text style={s.sectionTitle}>Legacy Coexistence</Text>
              <Text style={s.sectionSub}>Make AI work alongside the systems that run the enterprise</Text>
            </View>
          </View>
          <View style={[s.sectionBody, { borderColor: C.violetLight }]}>
            <View style={s.cardRow}>
              {[
                { num: "1", name: "Data Exhaust", when: "Legacy produces data AI can analyze without real-time access", trait: "Batch latency; decades of unanalyzed data" },
                { num: "2", name: "Sidecar", when: "AI augments legacy near-real-time without modifying it", trait: "Observes events; supplementary outputs; legacy is SoR" },
                { num: "3", name: "Gateway", when: "Controlled interface translating modern & legacy protocols", trait: "Encapsulates legacy complexity; deep interface knowledge" },
                { num: "4", name: "Shadow Pipeline", when: "AI replaces legacy gradually with validated parallel runs", trait: "Both run; outputs compared; confidence before cutover" },
                { num: "5", name: "Legacy-Aware Agent", when: "Autonomous agents across modern + legacy systems", trait: "Explicit legacy constraints; first-class in planning" },
              ].map((pt) => (
                <View key={pt.num} style={[s.card, { borderColor: C.violetLight, backgroundColor: C.violetLight + "40" }]}>
                  <View style={s.cardNumRow}>
                    <View style={[s.cardNum, { backgroundColor: C.violet }]}><Text style={s.cardNumText}>{pt.num}</Text></View>
                    <Text style={[s.cardTitle, { fontSize: 7.5 }]}>{pt.name}</Text>
                  </View>
                  <Text style={s.cardDesc}>{pt.when}</Text>
                  <View style={{ backgroundColor: C.violetLight + "80", borderRadius: 3, paddingHorizontal: 5, paddingVertical: 3, borderWidth: 1, borderColor: C.violetLight, marginTop: "auto" }}>
                    <Text style={{ fontSize: 6.5, color: C.violetDark, fontWeight: 600 }}>{pt.trait}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Key Questions + Anti-Patterns */}
        <View style={s.twoCol}>
          <View style={[s.panel, { borderColor: C.violetLight, backgroundColor: C.violetLight + "20" }]}>
            <Text style={s.panelTitle}>{"\u25C6"} Key Questions</Text>
            <Q color={C.violet} text="What interface types does the legacy system expose? (API, batch, terminal, file)" />
            <Q color={C.violet} text="What are the extraction constraints? Real-time API vs. nightly batch vs. quarterly exports?" />
            <Q color={C.violet} text="How stale can the data be before the value hypothesis becomes infeasible?" />
            <Q color={C.violet} text="When the AI and legacy system disagree, who wins per use case?" />
            <Q color={C.violet} text="What are the known data quality issues? Field inconsistencies? Missing data?" />
            <Q color={C.violet} text="How does this legacy system fail? What is the error recovery model?" />
          </View>
          <View style={[s.panel, { borderColor: C.red + "33", backgroundColor: C.redLight + "80" }]}>
            <Text style={s.panelTitle}>{"\u26A0"} Anti-Patterns</Text>
            <Anti name="The Greenfield Fantasy" desc={'"Once we modernize, we can deploy AI properly" is a strategy for never deploying AI'} />
            <Anti name="The Wrapper Illusion" desc={"API wrappers hide complexity but don\u2019t eliminate batch limits, formats, or failure modes"} />
            <Anti name="Integration Afterthought" desc={'"We\u2019ll figure out legacy integration later" \u2014 integration determines feasibility'} />
            <Anti name="Screen Scraping Default" desc="Works for demos; breaks in production. Last resort, not a pattern." />
            <Anti name="Strangler Fig Misconception" desc="Valid for deterministic modernization, dangerous for AI. AI creates net new capabilities." />
          </View>
        </View>

        {/* Modernization vs Coexistence table */}
        <View style={[s.table, { marginTop: 8 }]}>
          <View style={[s.tableHeader, { backgroundColor: C.violetDark, borderTopLeftRadius: 5, borderTopRightRadius: 5 }]}>
            <View style={{ width: 90 }}><Text style={[s.tableHeaderCell, { color: C.white }]}>Aspect</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.tableHeaderCell, { color: C.white }]}>Rip-and-Replace</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.tableHeaderCell, { color: C.white }]}>Legacy Coexistence</Text></View>
          </View>
          {[
            ["Premise", "Replace legacy, then deploy AI", "Deploy AI alongside legacy, deliberately designed for hybrid"],
            ["Timeline", "Years of multi-system migration", "Weeks to deploy AI, no modernization prerequisite"],
            ["Risk", "Existential \u2014 entire business on switchover", "Bounded \u2014 AI augments, legacy remains primary"],
            ["Data", "Assumes modern APIs and clean data", "Works with data exhaust, batch extracts, file formats"],
            ["Economics", "Hundreds of millions, long ROI", "Proportional to AI value capture"],
          ].map((row, i) => (
            <View key={i} style={s.tableRow}>
              <View style={{ width: 90 }}><Text style={[s.tableCell, s.tableCellLabel]}>{row[0]}</Text></View>
              <View style={{ flex: 1 }}><Text style={s.tableCell}>{row[1]}</Text></View>
              <View style={{ flex: 1 }}><Text style={[s.tableCell, { color: C.violetDark, fontWeight: 600 }]}>{row[2]}</Text></View>
            </View>
          ))}
        </View>
      </Page>

      {/* ═══ PAGE 4: Connections + Red Flags + Principles ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <Header pageLabel="Connections & Principles" />
        <Footer />

        {/* How the Pillars Connect */}
        <View style={[s.darkBox, { marginBottom: 10 }]}>
          <View style={s.darkBoxHeader}>
            <Text style={s.darkBoxTitle}>How the Pillars Connect</Text>
            <Text style={s.darkBoxSub}>The framework is a cycle, not a sequence</Text>
          </View>
          <View style={[s.darkBoxBody, { flexDirection: "row", gap: 10 }]}>
            <View style={[s.connBox, { borderLeftColor: C.teal }]}>
              <Text style={s.connTitle}>
                <Text style={{ color: C.tealDark }}>Signal Capture</Text> {"\u2192"} <Text style={{ color: C.blueDark }}>Grounded Delivery</Text>
              </Text>
              <Text style={s.connItem}>{"\u2022"} Value Hypothesis becomes primary input to Frame phase</Text>
              <Text style={s.connItem}>{"\u2022"} Value Tracking feeds probabilistic quality gates</Text>
            </View>
            <View style={[s.connBox, { borderLeftColor: C.violet }]}>
              <Text style={s.connTitle}>
                <Text style={{ color: C.tealDark }}>Signal Capture</Text> {"\u2192"} <Text style={{ color: C.violetDark }}>Legacy Coexistence</Text>
              </Text>
              <Text style={s.connItem}>{"\u2022"} Highest-value opportunities in decades of unanalyzed legacy data</Text>
              <Text style={s.connItem}>{"\u2022"} Data validation must account for legacy constraints</Text>
              <Text style={s.connItem}>{"\u2022"} Coexistence patterns determine value hypothesis feasibility</Text>
            </View>
            <View style={[s.connBox, { borderLeftColor: C.blue }]}>
              <Text style={s.connTitle}>
                <Text style={{ color: C.blueDark }}>Grounded Delivery</Text> {"\u2192"} <Text style={{ color: C.violetDark }}>Legacy Coexistence</Text>
              </Text>
              <Text style={s.connItem}>{"\u2022"} Explore phase must include legacy integration discovery</Text>
              <Text style={s.connItem}>{"\u2022"} Shadow Pipeline maps to Harden phase quality gates</Text>
              <Text style={s.connItem}>{"\u2022"} Dual-track governance for hybrid architectures</Text>
            </View>
          </View>
          <View style={{ backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.slate200 }}>
            <Text style={{ fontSize: 7, color: C.slate500, textAlign: "center" }}>
              <Text style={{ fontWeight: 700, color: C.navy }}>The feedback loop:</Text>{" "}
              Signal Capture identifies what to build. Grounded Delivery defines how. Legacy Coexistence ensures it works where it has to. Operate feeds back into Signal Capture.
            </Text>
          </View>
        </View>

        {/* Red Flags */}
        <View style={{ borderWidth: 1, borderColor: C.red + "44", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          <View style={[s.sectionHeader, { backgroundColor: C.red }]}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: C.white }}>Red Flags \u2014 When Something Is Going Wrong</Text>
          </View>
          <View style={{ backgroundColor: C.white, padding: 10, flexDirection: "row", gap: 12 }}>
            {[
              { title: "Signal Capture", color: C.tealDark, items: [
                "Cannot articulate value hypothesis in one sentence",
                'Initiative labeled "transformation" but is really automation',
                "No measurable outcome; success criteria are subjective",
                "3-6 months in, leading indicators haven\u2019t materialized",
                "80%+ of portfolio is automation; nothing converting",
              ]},
              { title: "Grounded Delivery", color: C.blueDark, items: [
                'Frame phase skipped \u2014 team wants to "start building"',
                "Eval dataset doesn\u2019t exist, is tiny, or unrepresentative",
                "Team completing stories but can\u2019t articulate progress toward value",
                'Quality defined as "it works" not probabilistic thresholds',
                "Deployed without production evaluation suite running",
              ]},
              { title: "Legacy Coexistence", color: C.violetDark, items: [
                '"We\u2019ll modernize first, then deploy AI"',
                "Legacy integration discovered late in Harden phase",
                "Integration discussed in abstract \u2014 no one tested actual behavior",
                "Trust boundaries between AI and legacy left ambiguous",
                "No contingency if legacy system becomes unavailable",
              ]},
            ].map((col) => (
              <View key={col.title} style={{ flex: 1 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: col.color, marginBottom: 4 }}>{col.title}</Text>
                {col.items.map((item, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 3, marginBottom: 2 }}>
                    <Text style={{ fontSize: 6, color: C.red, marginTop: 1 }}>{"\u2022"}</Text>
                    <Text style={{ fontSize: 6.5, color: C.slate500, lineHeight: 1.4, flex: 1 }}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Core Principles */}
        <View style={s.darkBox}>
          <View style={s.darkBoxHeader}>
            <Text style={s.darkBoxTitle}>Core Principles</Text>
          </View>
          <View style={[s.darkBoxBody, { flexDirection: "row", flexWrap: "wrap", gap: 8 }]}>
            {[
              { color: C.red, label: "Kill early.", text: "Every gate is a chance to stop spending on what won\u2019t work." },
              { color: C.blue, label: "Non-deterministic by default.", text: "AI outputs are distributions, not binaries. Design for it." },
              { color: C.violet, label: "Legacy is a feature.", text: "Decades of data and process logic are assets, not obstacles." },
              { color: C.teal, label: "Value before technology.", text: "If you can\u2019t articulate the value, you can\u2019t build the system." },
              { color: C.amber, label: "Operate forever.", text: "Non-deterministic systems need permanent monitoring and investment." },
              { color: C.emerald, label: "Coexist deliberately.", text: "Not rip-and-replace. Not wrappers. Intentional integration patterns." },
            ].map((p) => (
              <View key={p.label} style={[s.principleRow, { width: "30%" }]}>
                <View style={[s.principleDot, { backgroundColor: p.color }]} />
                <Text style={s.principleText}>
                  <Text style={{ fontWeight: 700, color: C.navy }}>{p.label}</Text> {p.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
