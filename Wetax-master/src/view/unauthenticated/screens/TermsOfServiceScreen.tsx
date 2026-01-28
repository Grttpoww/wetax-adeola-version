import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const TermsOfServiceScreen = () => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutzungsbedingungen</Text>
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
          1. Einleitung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Diese Nutzungsbedingungen („Bedingungen“) regeln Ihren Zugang zur und die Nutzung der
          Steuerberechnungs-App «Wetax» von Metax GmbH (im Folgenden „App“ oder der „Dienst“). Durch die
          Registrierung oder Nutzung der App erklären Sie sich mit diesen Bedingungen einverstanden. Die
          Metax GmbH („Unternehmen“, „wir“ oder „uns“), ein Schweizer Unternehmen, stellt diese App als
          sogenanntes Minimum Viable Product (MVP) zur Verfügung, um Nutzer bei der Berechnung und
          Erstellung von PDF-Steuerformularen für den Kanton Zürich zu unterstützen. Die App wird „wie
          gesehen“ bereitgestellt und kann technischen Einschränkungen sowie Fehlern unterliegen. Sie
          erkennen an, dass sich die App in einem frühen Entwicklungsstadium befindet und wir keine
          ununterbrochene oder fehlerfreie Funktionalität garantieren.
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
          2. Nutzungsberechtigung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Sie müssen volljährig und in der Schweiz wohnhaft sein, um die App nutzen zu dürfen. Die
          Nutzung des Dienstes ist ausschliesslich für Ihre eigene private Steuererklärung zulässig und
          nicht im Namen Dritter. Sie verpflichten sich, Ihr Benutzerkonto oder Ihre Steuerunterlagen
          nicht mit anderen zu teilen und den Dienst nicht zur Verarbeitung von Steuerdaten anderer
          Personen zu verwenden. Sie sind allein verantwortlich für die wahrheitsgemässe, vollständige
          und rechtlich zulässige Angabe Ihrer persönlichen und finanziellen Informationen. Eine
          missbräuchliche Nutzung des Dienstes oder das Einreichen von Daten anderer Personen ist strikt
          untersagt.
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
          3. Registrierung eines Benutzerkontos
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Um den Dienst nutzen zu können, müssen Sie ein Konto mit einer gültigen E-Mail-Adresse und
          einem Passwort erstellen. Sie sind dafür verantwortlich, die Vertraulichkeit Ihrer Zugangsdaten
          zu wahren. Sie verpflichten sich, uns unverzüglich zu benachrichtigen, falls Sie eine
          unautorisierte Nutzung Ihres Kontos vermuten. Wir behalten uns das Recht vor, Konten jederzeit
          und aus beliebigem Grund – insbesondere bei Verstoss gegen diese Bedingungen – zu sperren oder
          zu löschen.
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
          4. Leistungsbeschreibung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Die Metax GmbH stellt die App zur Verfügung, um auf Basis Ihrer Angaben steuerliche
          Berechnungen vorzunehmen und PDF-Dokumente zu erzeugen, die für die Einreichung bei der
          Steuerverwaltung des Kantons Zürich geeignet sind. Wir reichen keine Steuererklärungen in Ihrem
          Namen ein. Die App erstellt PDF-Formulare, die Sie selbst herunterladen und manuell einreichen
          müssen, es sei denn, in Zukunft wird eine explizit beschriebene Funktion zur automatisierten
          Übermittlung angeboten. Sie tragen die alleinige Verantwortung dafür, dass Ihre endgültige
          Einreichung mit dem Schweizer Steuerrecht übereinstimmt und fristgerecht erfolgt. Wir geben
          keine Zusicherung oder Garantie dafür, dass die durch die App erstellten Berechnungen oder
          Dokumente korrekt, vollständig oder rechtskonform sind.
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
          5. Pflichten und Einschränkungen der Nutzer
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>Sie verpflichten sich:</Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          (a) wahrheitsgemässe und korrekte Angaben zu machen;
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          (b) alle anwendbaren Gesetze und Vorschriften bei der Nutzung des Dienstes einzuhalten; und
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 8 }}>
          (c) den Dienst ausschliesslich für Ihre persönliche Steuererklärung zu verwenden.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Es ist Ihnen untersagt, die App oder Teile davon zu kopieren, zu verbreiten, zu verkaufen oder
          zu verändern. Ebenso dürfen Sie die zugrundeliegenden Codes oder Algorithmen weder
          entschlüsseln noch analysieren oder Rückentwicklungen (Reverse Engineering) vornehmen. Sie
          dürfen den Dienst nicht verwenden, um Daten anderer Personen zu sammeln, Nutzungsverhalten zu
          analysieren oder rechtswidrige bzw. schädliche Handlungen vorzunehmen.
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Alle urheberrechtlich geschützten Materialien oder persönlichen Daten (z. B. Dokumente oder
          Steuerinformationen), die Sie in die App hochladen, bleiben Ihr Eigentum. Sie gewähren der
          Metax GmbH jedoch eine Lizenz zur Verarbeitung dieser Daten, soweit dies zur Erbringung des
          Dienstes erforderlich ist.
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
          6. Zahlungsbedingungen
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Die Nutzung der App ist nicht vollständig kostenlos; sie basiert auf einem Abonnementmodell
          oder einer zahlungspflichtigen Einzelverwendung pro Steuererklärung. Mit Abschluss eines
          Abonnements oder einer Zahlung ermächtigen Sie uns (bzw. unseren Zahlungsdienstleister), Ihre
          Kreditkarte oder ein anderes Zahlungsmittel mit den zum Zeitpunkt der Bestellung angegebenen
          Gebühren zu belasten. Sämtliche Gebühren sind nicht erstattungsfähig, ausser wenn gesetzlich
          vorgeschrieben oder ausdrücklich schriftlich vereinbart. Sie sind verantwortlich für die
          Zahlung allfälliger Mehrwertsteuern (MWST) oder anderer anwendbarer Abgaben. Bei ausbleibender
          Zahlung können wir Ihren Zugang zum Dienst sperren oder beenden. Für die Zahlungsabwicklung
          nutzen wir Drittanbieter, die eigene Geschäftsbedingungen und Datenschutzpraktiken anwenden.
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
          7. Technische Einschränkungen und Haftungsausschluss
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Da es sich bei der App um ein MVP handelt, können Fehler oder technische Mängel auftreten. Die
          Nutzung erfolgt auf eigenes Risiko. DER DIENST WIRD „WIE GESEHEN“ BEREITGESTELLT, OHNE JEGLICHE
          GEWÄHRLEISTUNG, WEDER AUSDRÜCKLICH, STILLSCHWEIGEND NOCH GESETZLICH. Die Metax GmbH lehnt
          insbesondere stillschweigende Garantien hinsichtlich Marktgängigkeit, Eignung für einen
          bestimmten Zweck, Genauigkeit, Vollständigkeit, Rechtsmängelfreiheit sowie Nichtverletzung von
          Rechten Dritter ausdrücklich ab. Wir garantieren nicht, dass der Dienst all Ihren Anforderungen
          entspricht, fehlerfrei, unterbrechungsfrei oder sicher ist. Wir übernehmen keine Haftung für
          Schäden an Ihrer IT-Infrastruktur oder Datenverluste infolge der Nutzung des Dienstes.
          SÄMTLICHE RISIKEN UND KOSTEN IM ZUSAMMENHANG MIT DER NUTZUNG DES DIENSTES – EINSCHLIESSLICH
          ETWAIGER FEHLER IN DEN DATEN – TRAGEN AUSSCHLIESSLICH SIE.
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
          8. Dienste Dritter
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Die App nutzt Dienste Dritter für bestimmte Funktionen (z. B. PDF-Generierung,
          Cloud-Speicherung oder Analytik). Diese Anbieter verarbeiten Daten in unserem Auftrag und
          gemäss unseren Weisungen. Zudem kann die App Inhalte oder Dienste Dritter einbetten. Sie
          erklären sich damit einverstanden, dass Metax GmbH nicht für Handlungen oder Unterlassungen
          dieser Drittanbieter haftbar ist. Die Nutzung von Drittanbieterdiensten unterliegt deren
          eigenen Nutzungsbedingungen; Metax GmbH übernimmt keine Verantwortung für deren
          Datenschutzpraktiken.
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
          9. Haftungsbeschränkung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          SOWEIT GESETZLICH ZULÄSSIG, HAFTET METAX GMBH NICHT FÜR INDIREKTE, ZUFÄLLIGE, BESONDERE ODER
          FOLGESCHÄDEN, ENTGANGENEN GEWINN, DATENVERLUST ODER SONSTIGE SCHÄDEN, DIE IM ZUSAMMENHANG MIT
          DEM DIENST ENTSTEHEN. Unsere Gesamthaftung für jegliche Ansprüche im Zusammenhang mit dem
          Dienst ist auf den Betrag begrenzt, den Sie in den sechs Monaten vor dem betreffenden Anspruch
          für den Dienst bezahlt haben. Sie erkennen an, dass Sie allein für die Einhaltung steuerlicher
          Pflichten, Fristen, Sanktionen oder rechtlicher Konsequenzen im Zusammenhang mit der Nutzung
          der App verantwortlich sind.
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
          10. Freistellung (Schadloshaltung)
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Sie verpflichten sich, die Metax GmbH sowie deren verbundene Unternehmen von sämtlichen
          Ansprüchen, Verlusten, Schäden, Haftungen und Kosten (einschliesslich Anwaltskosten)
          freizustellen, die sich aus einem Verstoss Ihrerseits gegen diese Bedingungen, einer
          missbräuchlichen Nutzung des Dienstes oder einer Verletzung gesetzlicher Vorschriften oder
          Rechte Dritter ergeben.
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
          11. Beendigung
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Wir können Ihren Zugang zum Dienst jederzeit und aus beliebigem Grund beenden oder aussetzen,
          insbesondere bei Verstoss gegen diese Bedingungen oder wenn wir nach eigenem Ermessen der
          Meinung sind, dass Ihre Nutzung des Dienstes ein Risiko für uns oder andere darstellt. Im Falle
          einer Beendigung endet Ihr Nutzungsrecht mit sofortiger Wirkung. Bestimmungen dieser
          Bedingungen, die ihrer Natur nach über die Beendigung hinaus Wirkung entfalten sollen (wie
          z. B. Haftungsausschlüsse, Haftungsbeschränkung und anwendbares Recht), bleiben weiterhin
          gültig.
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
          12. Änderungen
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Wir behalten uns vor, diese Bedingungen jederzeit zu ändern, indem wir eine überarbeitete
          Fassung veröffentlichen. Das „Datum des Inkrafttretens“ am Anfang dieses Dokuments gibt an,
          wann die letzte Aktualisierung erfolgt ist. Durch die fortgesetzte Nutzung des Dienstes nach
          Veröffentlichung stimmen Sie den geänderten Bedingungen zu.
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
          13. Anwendbares Recht und Gerichtsstand
        </Text>
        <Text style={{ fontSize: 15, marginBottom: 16 }}>
          Diese Bedingungen sowie Ihre Nutzung des Dienstes unterliegen ausschliesslich dem
          schweizerischen Recht, unter Ausschluss kollisionsrechtlicher Bestimmungen. Ausschliesslicher
          Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesen Bedingungen ist
          Zürich (Kanton Zürich), sofern nicht zwingendes Recht einen anderen Gerichtsstand vorschreibt.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TermsOfServiceScreen

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
