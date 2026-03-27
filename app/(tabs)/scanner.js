import { useState } from "react";
import { Text, View, Button, StyleSheet, ScrollView, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [csvContent, setCsvContent] = useState("");

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required to scan QR codes.</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  const path = Platform.OS !== 'web' ? FileSystem.documentDirectory + 'scanned_data.csv' : null;

  async function writeCSV(data) {
    const row = data + '\n';
    if (Platform.OS === 'web') {
      setCsvContent(prev => prev + row);
      return;
    }
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      const existing = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
      await FileSystem.writeAsStringAsync(path, existing + row, { encoding: 'utf8' });
    } else {
      await FileSystem.writeAsStringAsync(path, row, { encoding: 'utf8' });
    }
  }

  async function readCSV() {
    if (Platform.OS === 'web') return;
    const content = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
    setCsvContent(content);
  }

  async function exportCSV() {
    if (Platform.OS === 'web') {
      if (!csvContent) {
        alert("No data to export yet.");
        return;
      }
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scanned_data.csv';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) {
      alert("No data to export yet.");
      return;
    }
    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        alert("Permission to access storage was denied.");
        return;
      }
      try {
        const content = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          'scanned_data.csv',
          'text/csv'
        );
        await FileSystem.writeAsStringAsync(newUri, content, { encoding: 'utf8' });
        alert("CSV saved to your chosen folder!");
      } catch (e) {
        console.error(e);
        alert("Failed to save file.");
      }
    } else {
      await Sharing.shareAsync(path, {
        mimeType: 'text/csv',
        dialogTitle: 'Save CSV File',
        UTI: 'public.comma-separated-values-text',
      });
    }
  }

  async function clearCSV() {
    if (Platform.OS === 'web') {
      setCsvContent("");
      setScannedData("");
      return;
    }
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      await FileSystem.writeAsStringAsync(path, "", { encoding: "utf8" });
    }
    setCsvContent("");
    setScannedData("");
  }

  const handleBarcodeScanned = ({ data }) => {
    setScanned(true);
    console.log("SCANNED:", data);
    setScannedData(data);
    writeCSV(data);
    readCSV();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
      >
        <Text style={styles.text}>Scanned Data:</Text>
        <Text style={styles.data}>{scannedData}</Text>
        <Text style={styles.data}>{csvContent}</Text>

        {scanned && (
          <Button
            title="Scan Again"
            onPress={() => {
              setScanned(false);
              setScannedData("");
            }}
          />
        )}

        <Button title="Export CSV" onPress={exportCSV} />
        <Button title="Clear CSV" onPress={clearCSV} color="red" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 3 },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: { fontSize: 20, marginBottom: 10, color: '#ffffff' },
  data: { fontSize: 16, marginBottom: 20, color: '#ffffff' },
});