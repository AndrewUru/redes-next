import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { IntakeData } from "@/lib/intake/schema";

const colors = {
  ink: "#111827",
  muted: "#6b7280",
  soft: "#f3f4f6",
  softBlue: "#eff6ff",
  blue: "#2563eb",
  blueDark: "#1e3a8a",
  border: "#e5e7eb",
  card: "#ffffff",
  accent: "#f59e0b"
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 34,
    paddingBottom: 46,
    fontSize: 10.5,
    lineHeight: 1.45,
    color: colors.ink,
    backgroundColor: "#f8fafc"
  },

  hero: {
    backgroundColor: colors.blueDark,
    color: "#ffffff",
    padding: 22,
    borderRadius: 14,
    marginBottom: 18
  },

  eyebrow: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#bfdbfe",
    marginBottom: 7,
    fontWeight: 700
  },

  title: {
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.12,
    marginBottom: 7
  },

  subtitle: {
    fontSize: 10.5,
    color: "#dbeafe",
    maxWidth: 430
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },

  metaPill: {
    backgroundColor: "#ffffff",
    color: colors.blueDark,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
    fontSize: 8.5,
    fontWeight: 700
  },

  section: {
    backgroundColor: colors.card,
    border: `1 solid ${colors.border}`,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    paddingBottom: 7,
    borderBottom: `1 solid ${colors.border}`
  },

  sectionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.blue,
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 4,
    marginRight: 8
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.ink
  },

  row: {
    marginBottom: 6
  },

  label: {
    fontSize: 8.5,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: 700,
    marginBottom: 2
  },

  value: {
    fontSize: 10.5,
    color: colors.ink
  },

  grid: {
    flexDirection: "row",
    gap: 10
  },

  col: {
    flex: 1
  },

  list: {
    marginTop: 2
  },

  bulletRow: {
    flexDirection: "row",
    marginBottom: 4
  },

  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blue,
    marginTop: 6,
    marginRight: 7
  },

  bulletText: {
    flex: 1,
    fontSize: 10.2,
    color: colors.ink
  },

  highlightBox: {
    backgroundColor: colors.softBlue,
    border: `1 solid #bfdbfe`,
    borderRadius: 10,
    padding: 10,
    marginTop: 4
  },

  ctaBox: {
    backgroundColor: "#fffbeb",
    border: `1 solid #fde68a`,
    borderRadius: 10,
    padding: 10,
    marginTop: 4
  },

  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 20,
    borderTop: `1 solid ${colors.border}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.muted,
    fontSize: 8
  },

  footerStrong: {
    fontWeight: 700,
    color: colors.ink
  }
});

function asArray(value: string[] | undefined | null): string[] {
  if (!value || value.length === 0) return ["Sin definir"];
  return value;
}

function clean(value: string | undefined | null): string {
  return value?.trim() ? value : "Sin definir";
}

function Field({
  label,
  value
}: {
  label: string;
  value: string | undefined | null;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{clean(value)}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] | undefined | null }) {
  return (
    <View style={styles.list}>
      {asArray(items).map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Section({
  number,
  title,
  children
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function BrandbookDocument({
  clientName,
  data
}: {
  clientName: string;
  data: IntakeData;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Brandbook estrategico</Text>
          <Text style={styles.title}>Libro de Marca - {clientName}</Text>
          <Text style={styles.subtitle}>
            Version ejecutable para contenido, narrativa, posicionamiento y
            conversion.
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>Contenido</Text>
            <Text style={styles.metaPill}>Marca</Text>
            <Text style={styles.metaPill}>Conversion</Text>
          </View>
        </View>

        <Section number="01" title="Brand Identity">
          <Field label="Brand name" value={data.identity.brandName} />
          <Field label="Tagline" value={data.identity.tagline} />
          <View style={styles.highlightBox}>
            <Field label="Mision" value={data.identity.mission} />
          </View>
        </Section>

        <Section number="02" title="Growth Goals">
          <Text style={styles.label}>Objetivos de negocio</Text>
          <BulletList items={data.goals.businessGoals} />
          <Field label="Corto plazo" value={data.goals.shortTermGoals} />
        </Section>

        <Section number="03" title="Audience Fit">
          <Field
            label="Audiencia primaria"
            value={data.audience.primaryAudience}
          />
          <Text style={styles.label}>Pain points</Text>
          <BulletList items={data.audience.painPoints} />
        </Section>

        <Section number="04" title="Brand Voice">
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Atributos de voz</Text>
              <BulletList items={data.tone.voiceAttributes} />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Palabras a evitar</Text>
              <BulletList items={data.tone.forbiddenWords} />
            </View>
          </View>
        </Section>

        <Section number="05" title="Content System">
          <Text style={styles.label}>Pilares</Text>
          <BulletList items={data.pillars.contentPillars} />

          <View style={styles.highlightBox}>
            <Field label="Mensaje central" value={data.messaging.coreMessage} />
          </View>

          <Text style={styles.label}>Diferenciales</Text>
          <BulletList items={data.messaging.differentiators} />
        </Section>

        <Section number="06" title="Conversion Path">
          <View style={styles.ctaBox}>
            <Field label="CTA principal" value={data.ctas.primaryCTA} />
            <Field label="CTA secundaria" value={data.ctas.secondaryCTA} />
          </View>
        </Section>

        <Section number="07" title="Visual Identity">
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Colores</Text>
              <BulletList items={data.visual.colorPreferences} />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Visual DO</Text>
              <BulletList items={data.visual.visualDo} />
            </View>
          </View>

          <Text style={styles.label}>Visual DONT</Text>
          <BulletList items={data.visual.visualDont} />
        </Section>

        <Section number="08" title="Referencias y Operacion">
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Competidores / referentes</Text>
              <BulletList items={data.references.competitors} />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Inspiracion</Text>
              <BulletList items={data.references.inspirationLinks} />
            </View>
          </View>

          <Field label="Aprobaciones" value={data.logistics.approvalsFlow} />
          <Field label="Frecuencia" value={data.logistics.postingFrequency} />
        </Section>

        <View style={styles.footer} fixed>
          <Text>
            <Text style={styles.footerStrong}>{clientName}</Text> - Libro de
            Marca
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
