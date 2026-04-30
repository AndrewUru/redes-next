import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { IntakeData } from "@/lib/intake/schema";

const colors = {
  ink: "#111827",
  muted: "#4b5563",
  soft: "#f3f4f6",
  softBlue: "#eff6ff",
  blue: "#2563eb",
  blueDark: "#1e3a8a",
  border: "#d1d5db",
  card: "#ffffff",
  accent: "#f59e0b"
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 34,
    paddingBottom: 46,
    fontSize: 11,
    lineHeight: 1.5,
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
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#bfdbfe",
    marginBottom: 7,
    fontWeight: 700
  },

  title: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.12,
    marginBottom: 7
  },

  subtitle: {
    fontSize: 11,
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
    fontSize: 14,
    fontWeight: 700,
    color: colors.ink
  },

  sectionDescription: {
    fontSize: 9,
    color: colors.muted,
    marginTop: -2,
    marginBottom: 8
  },

  row: {
    marginBottom: 6
  },

  label: {
    fontSize: 9,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: 700,
    marginBottom: 2
  },

  value: {
    fontSize: 11,
    color: colors.ink
  },

  helpText: {
    fontSize: 9.5,
    color: colors.muted,
    marginTop: 3
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
    fontSize: 10.8,
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

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    border: `1 solid ${colors.border}`,
    borderRadius: 10,
    padding: 9
  },

  summaryValue: {
    fontSize: 10,
    color: colors.ink,
    fontWeight: 700,
    marginTop: 2
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
  const cleanItems = (value ?? []).map((item) => item.trim()).filter(Boolean);
  if (cleanItems.length === 0) return ["Sin definir"];
  return cleanItems;
}

function clean(value: string | undefined | null): string {
  return value?.trim() ? value.trim() : "Sin definir";
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
          <Text style={styles.bulletText}>{clean(item)}</Text>
        </View>
      ))}
    </View>
  );
}

function Section({
  number,
  title,
  description,
  children
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section} wrap={false} minPresenceAhead={80}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.summaryValue}>{clean(value)}</Text>
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
  const documentTitle = `Libro de marca - ${clientName}`;

  return (
    <Document
      title={documentTitle}
      author="ElSaltoWeb"
      subject="Guía estratégica de marca para contenido, posicionamiento y conversión"
      keywords="marca, estrategia, contenido, posicionamiento, conversión"
      creator="ElSaltoWeb"
      producer="ElSaltoWeb"
      language="es-ES"
    >
      <Page size="A4" style={styles.page} bookmark={documentTitle}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Guía estratégica de marca</Text>
          <Text style={styles.title}>Libro de marca - {clientName}</Text>
          <Text style={styles.subtitle}>
            Versión práctica para ordenar mensaje, contenido, tono,
            posicionamiento y conversión.
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>Contenido</Text>
            <Text style={styles.metaPill}>Marca</Text>
            <Text style={styles.metaPill}>Conversión</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Marca" value={data.identity.brandName} />
          <SummaryCard label="Objetivo" value={data.goals.businessGoals[0]} />
          <SummaryCard label="Acción clave" value={data.ctas.primaryCTA} />
        </View>

        <Section
          number="01"
          title="Identidad de marca"
          description="Base para entender quién eres, qué haces y cómo quieres que te perciban."
        >
          <Field label="Nombre de marca" value={data.identity.brandName} />
          <Field label="Frase corta" value={data.identity.tagline} />
          <View style={styles.highlightBox}>
            <Field label="Misión" value={data.identity.mission} />
          </View>
        </Section>

        <Section
          number="02"
          title="Objetivos de crecimiento"
          description="Prioridades que deben orientar contenido, decisiones y medición."
        >
          <Text style={styles.label}>Objetivos de negocio</Text>
          <BulletList items={data.goals.businessGoals} />
          <Field label="Corto plazo" value={data.goals.shortTermGoals} />
        </Section>

        <Section
          number="03"
          title="Audiencia ideal"
          description="Personas a las que hablamos y problemas que deben sentirse reconocidos."
        >
          <Field
            label="Audiencia primaria"
            value={data.audience.primaryAudience}
          />
          <Text style={styles.label}>Problemas, dudas o necesidades</Text>
          <BulletList items={data.audience.painPoints} />
        </Section>

        <Section
          number="04"
          title="Voz y tono"
          description="Guía para que los textos suenen coherentes en redes, web y mensajes comerciales."
        >
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Cómo debe sonar</Text>
              <BulletList items={data.tone.voiceAttributes} />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Palabras o estilos a evitar</Text>
              <BulletList items={data.tone.forbiddenWords} />
            </View>
          </View>
        </Section>

        <Section
          number="05"
          title="Sistema de contenido"
          description="Temas y mensajes que ayudan a publicar con dirección, no por improvisación."
        >
          <Text style={styles.label}>Pilares de contenido</Text>
          <BulletList items={data.pillars.contentPillars} />

          <View style={styles.highlightBox}>
            <Field label="Mensaje central" value={data.messaging.coreMessage} />
          </View>

          <Text style={styles.label}>Diferenciales</Text>
          <BulletList items={data.messaging.differentiators} />
        </Section>

        <Section
          number="06"
          title="Ruta de conversión"
          description="Acciones que queremos facilitar para transformar atención en oportunidad."
        >
          <View style={styles.ctaBox}>
            <Field label="CTA principal" value={data.ctas.primaryCTA} />
            <Field label="CTA secundario" value={data.ctas.secondaryCTA} />
          </View>
          <Text style={styles.helpText}>
            Usa estas llamadas a la acción de forma consistente en perfiles,
            publicaciones, web y piezas comerciales.
          </Text>
        </Section>

        <Section
          number="07"
          title="Dirección visual"
          description="Criterios para mantener una presencia reconocible y evitar decisiones visuales incoherentes."
        >
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Colores</Text>
              <BulletList items={data.visual.colorPreferences} />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Sí usar</Text>
              <BulletList items={data.visual.visualDo} />
            </View>
          </View>

          <Text style={styles.label}>Evitar</Text>
          <BulletList items={data.visual.visualDont} />
        </Section>

        <Section
          number="08"
          title="Referencias y forma de trabajo"
          description="Contexto externo y acuerdos operativos para avanzar con claridad."
        >
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.label}>Competidores / referentes</Text>
              <BulletList items={data.references.competitors} />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Inspiración</Text>
              <BulletList items={data.references.inspirationLinks} />
            </View>
          </View>

          <Field label="Aprobaciones" value={data.logistics.approvalsFlow} />
          <Field label="Frecuencia" value={data.logistics.postingFrequency} />
        </Section>

        <View style={styles.footer} fixed>
          <Text>
            <Text style={styles.footerStrong}>{clientName}</Text> - Libro de
            marca
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
