import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datenschutzerklärung</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f7f8fa', borderRadius: 16 }}>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          1. Verantwortlicher
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Verantwortlich für die Erhebung und Verarbeitung personenbezogener Daten im Zusammenhang mit
          der Nutzung dieser App ist die Metax GmbH, Schweiz. Wir verarbeiten Ihre Daten in
          Übereinstimmung mit dem revidierten Schweizer Datenschutzgesetz (revDSG) sowie allen weiteren
          anwendbaren datenschutzrechtlichen Vorschriften. Diese Datenschutzerklärung erläutert, welche
          Daten wir erheben, wie wir diese verwenden und welche Rechte Sie haben.
        </Text>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          2. Erhobene personenbezogene Daten
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Wir erheben und verarbeiten die personenbezogenen Daten, die Sie uns zur Nutzung der App zur
          Verfügung stellen. Dazu gehören insbesondere:
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Identifikations- und Kontaktdaten (z. B. Name, Adresse, E-Mail-Adresse)
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Finanzielle und steuerrelevante Angaben (z. B. Einkommen, Abzüge, Vermögenswerte, Schulden)
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Hochgeladene Dokumente (z. B. Lohnabrechnungen, Kontoauszüge, Ausweise)
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Sonstige durch Sie eingegebene Inhalte, die zur Erstellung der Steuererklärung erforderlich
          sind
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Darüber hinaus erfassen wir technische Nutzungsdaten wie IP-Adresse, Login-Verläufe,
          Geräteinformationen sowie – im Falle eines Abonnements – Zahlungsinformationen (die über
          Drittanbieter verarbeitet werden).
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Bitte übermitteln Sie keine Daten Dritter (z. B. von Familienmitgliedern oder Mandanten).
        </Text>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          3. Zweck der Datenverarbeitung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Wir verarbeiten Ihre Daten ausschliesslich zur Bereitstellung und Verbesserung unseres
          Dienstes:
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • zur Durchführung von Steuerberechnungen basierend auf Ihren Eingaben
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • zur Speicherung Ihrer Angaben und Dokumente zur späteren Bearbeitung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • zur Erstellung von PDF-Dokumenten für Ihre Steuererklärung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • zur Kommunikation mit Ihnen über Ihr Konto und App-bezogene Informationen
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Darüber hinaus verwenden wir anonymisierte oder aggregierte Daten zur Analyse von
          Nutzungsmustern, zur Behebung technischer Probleme sowie zur Verbesserung unserer Algorithmen
          und Nutzerfreundlichkeit.
        </Text>

        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          4. Rechtsgrundlagen
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf folgenden rechtlichen Grundlagen:
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Vertragserfüllung, da die Datenverarbeitung notwendig ist, um Ihnen die angeforderte
          Dienstleistung bereitzustellen;
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Gesetzliche Verpflichtung, insbesondere zur Einhaltung steuerrechtlicher Vorgaben;
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Einwilligung, sofern wir für bestimmte optionale Funktionen (z. B. Analysezwecke) darauf
          angewiesen sind. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft
          widerrufen.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist –
          stets im Einklang mit dem revDSG.
        </Text>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          5. Datenübermittlung und -speicherung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Ihre Daten werden grundsätzlich auf Servern in der Schweiz gespeichert und verarbeitet. In
          einzelnen Fällen kann es vorkommen, dass Daten durch unsere Dienstleister in anderen
          europäischen Ländern verarbeitet werden. Die Schweiz wird von der Europäischen Kommission als
          Land mit angemessenem Datenschutzniveau anerkannt, weshalb Datenübermittlungen in die EU ohne
          zusätzliche Schutzmassnahmen zulässig sind.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Falls in Ausnahmefällen Daten in Drittländer ohne entsprechendes Angemessenheitsurteil
          übermittelt werden, stellen wir geeignete Garantien sicher (z. B. Standardvertragsklauseln).
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Wir setzen etablierte Drittanbieter für Cloud-Speicherung, PDF-Generierung, Zahlungsabwicklung
          und Analytik ein. Diese Anbieter sind vertraglich verpflichtet, Ihre Daten vertraulich und
          sicher zu behandeln.
        </Text>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          6. Aufbewahrungsdauer
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Wir speichern Ihre personenbezogenen Daten nur so lange, wie es zur Erfüllung der
          Dienstleistung oder zur Einhaltung gesetzlicher Pflichten erforderlich ist. Steuerrelevante
          Daten unterliegen in der Schweiz in der Regel einer Aufbewahrungspflicht von bis zu zehn
          Jahren. Nach Ablauf der Speicherfrist werden Ihre Daten entweder vollständig gelöscht oder
          irreversibel anonymisiert.
        </Text>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          7. Ihre Rechte
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Gemäss dem revidierten Schweizer Datenschutzgesetz (revDSG) haben Sie folgende Rechte in Bezug
          auf Ihre personenbezogenen Daten:
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#1d2dba' }}>
            7.1 Recht auf Auskunft und Berichtigung:
          </Text>{' '}
          Sie können Auskunft darüber verlangen, welche personenbezogenen Daten wir über Sie speichern,
          und unrichtige oder unvollständige Angaben korrigieren lassen.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#1d2dba' }}>
            7.2 Recht auf Löschung („Recht auf Vergessenwerden“):
          </Text>{' '}
          Sie haben das Recht, die Löschung Ihrer Daten zu verlangen, wenn diese für die Zwecke, für die
          sie erhoben wurden, nicht mehr erforderlich sind oder wenn Sie Ihre Einwilligung widerrufen.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#1d2dba' }}>
            7.3 Recht auf Datenübertragbarkeit:
          </Text>{' '}
          Sie können verlangen, dass wir Ihnen Ihre personenbezogenen Daten in einem strukturierten,
          gängigen und maschinenlesbaren Format zur Verfügung stellen, sodass Sie diese an einen anderen
          Dienst übertragen können.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#1d2dba' }}>
            7.4 Recht auf Einschränkung oder Widerspruch:
          </Text>{' '}
          Sie können die Einschränkung der Verarbeitung oder der Nutzung Ihrer Daten verlangen bzw.
          dieser widersprechen, sofern ein berechtigter Grund vorliegt.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#1d2dba' }}>7.5 Recht auf Beschwerde:</Text> Wenn
          Sie der Ansicht sind, dass Ihre Daten unrechtmässig verarbeitet wurden, können Sie sich bei der
          Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) oder bei einem zuständigen
          Gericht beschweren.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Zur Ausübung dieser Rechte oder bei Fragen zur Verarbeitung Ihrer Daten kontaktieren Sie bitte
          unseren Datenschutzbeauftragten unter privacy@metax.ch oder postalisch an unsere
          Unternehmensadresse. Wir beantworten Ihre Anfrage in der Regel innerhalb von 30 Tagen gemäss
          den Vorgaben des revDSG.
        </Text>

        <Text
          style={{
            fontSize: 18,
            marginBottom: 14,
            fontWeight: 'bold',
            color: '#1d2dba',
            letterSpacing: 0.5,
          }}
        >
          8. Datensicherheit
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Wir setzen angemessene technische und organisatorische Sicherheitsmassnahmen ein, um Ihre
          personenbezogenen Daten vor unbefugtem Zugriff, Verlust, Veränderung oder Offenlegung zu
          schützen. Dazu gehören unter anderem:
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          • Verschlüsselung von Daten während der Übertragung und Speicherung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>• Sichere Authentifizierungsverfahren</Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>• Regelmässige Sicherheitsüberprüfungen</Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>• Strikte Zugriffskontrollen</Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          Bitte beachten Sie jedoch, dass kein System vollkommen sicher ist. Wir empfehlen Ihnen daher,
          Ihre Zugangsdaten sorgfältig zu verwahren und uns umgehend über etwaige Sicherheitsbedenken zu
          informieren.
        </Text>
        <View>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 14,
              fontWeight: 'bold',
              color: '#1d2dba',
              letterSpacing: 0.5,
            }}
          >
            9. Cookies und Webanalyse
          </Text>
          <Text style={{ fontSize: 15, marginBottom: 8 }}>
            Wir verwenden Cookies und ähnliche Technologien, um die App technisch zu betreiben und Ihr
            Nutzungserlebnis zu verbessern. Zudem nutzen wir Webanalyse-Tools (z. B. Google Analytics),
            um aggregierte Nutzungsdaten zu erfassen. Diese Analysen beruhen ausschliesslich auf
            pseudonymisierten oder aggregierten Daten und ermöglichen keinen Rückschluss auf Ihre
            Identität.
          </Text>
          <Text style={{ fontSize: 15, marginBottom: 8 }}>
            Sie können Cookies in den Einstellungen Ihres Browsers deaktivieren. Bitte beachten Sie
            jedoch, dass dadurch die Funktionalität der App eingeschränkt werden kann.
          </Text>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 14,
              fontWeight: 'bold',
              color: '#1d2dba',
              letterSpacing: 0.5,
            }}
          >
            10. Änderungen dieser Datenschutzerklärung
          </Text>
          <Text style={{ fontSize: 15, marginBottom: 8 }}>
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren, um geänderten
            rechtlichen Anforderungen oder neuen Funktionen gerecht zu werden. Änderungen werden auf
            dieser Seite mit aktualisiertem „Datum des Inkrafttretens“ veröffentlicht.
          </Text>
          <Text style={{ fontSize: 15, marginBottom: 8 }}>
            Wir empfehlen Ihnen, die Datenschutzerklärung regelmässig zu überprüfen. Mit der weiteren
            Nutzung der App nach erfolgten Änderungen erklären Sie sich mit der jeweils aktuellen Fassung
            einverstanden.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PrivacyPolicyScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
})
