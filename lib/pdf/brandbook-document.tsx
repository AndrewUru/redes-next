import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import type { IntakeData } from "@/lib/intake/schema";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, lineHeight: 1.45, color: "#111827" },
  header: { marginBottom: 16, borderBottom: "2 solid #111827", paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 10, marginTop: 4, color: "#4b5563" },
  section: { marginBottom: 10, borderBottom: "1 solid #e5e7eb", paddingBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 5 },
  line: { marginBottom: 2 },
  label: { fontWeight: 700 },
  bullet: { marginLeft: 8, marginBottom: 2 }
});

function asArray(value: string[] | undefined | null): string[] {
  if (!value || value.length === 0) return ["Sin definir"];
  return value;
}

function line(label: string, value: string | undefined | null): string {
  return `${label}: ${value?.trim() ? value : "Sin definir"}`;
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
        <View style={styles.header}>
          <Text style={styles.title}>Libro de Marca - {clientName}</Text>
          <Text style={styles.subtitle}>Version ejecutable para contenido, narrativa y conversion</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Identity</Text>
          <Text style={styles.line}>{line("Brand name", data.identity.brandName)}</Text>
          <Text style={styles.line}>{line("Tagline", data.identity.tagline)}</Text>
          <Text style={styles.line}>{line("Mision", data.identity.mission)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Goals</Text>
          <Text style={styles.label}>Objetivos de negocio</Text>
          {asArray(data.goals.businessGoals).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.line}>{line("Corto plazo", data.goals.shortTermGoals)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audience Fit</Text>
          <Text style={styles.line}>{line("Audiencia primaria", data.audience.primaryAudience)}</Text>
          <Text style={styles.label}>Pain points</Text>
          {asArray(data.audience.painPoints).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Voice</Text>
          <Text style={styles.label}>Atributos de voz</Text>
          {asArray(data.tone.voiceAttributes).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.label}>Palabras a evitar</Text>
          {asArray(data.tone.forbiddenWords).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content System</Text>
          <Text style={styles.label}>Pilares</Text>
          {asArray(data.pillars.contentPillars).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.line}>{line("Mensaje central", data.messaging.coreMessage)}</Text>
          <Text style={styles.label}>Diferenciales</Text>
          {asArray(data.messaging.differentiators).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversion Path</Text>
          <Text style={styles.line}>{line("CTA principal", data.ctas.primaryCTA)}</Text>
          <Text style={styles.line}>{line("CTA secundaria", data.ctas.secondaryCTA)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Identity</Text>
          <Text style={styles.label}>Colores</Text>
          {asArray(data.visual.colorPreferences).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.label}>Visual DO</Text>
          {asArray(data.visual.visualDo).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.label}>Visual DONT</Text>
          {asArray(data.visual.visualDont).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referencias y Operacion</Text>
          <Text style={styles.label}>Competidores / referentes</Text>
          {asArray(data.references.competitors).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.label}>Inspiracion</Text>
          {asArray(data.references.inspirationLinks).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <Text style={styles.line}>{line("Aprobaciones", data.logistics.approvalsFlow)}</Text>
          <Text style={styles.line}>{line("Frecuencia", data.logistics.postingFrequency)}</Text>
        </View>
      </Page>
    </Document>
  );
}
