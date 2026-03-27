import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from "react";
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [csvRows, setCsvRows] = useState("");
  const csvRowsRef = useRef("");

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

  const path = FileSystem.documentDirectory + 'scanned_data.csv';

  async function writeCSV(data) {
  try {
    const row = data + '\n';

    if (Platform.OS === 'web') {
      csvRowsRef.current += row;        // <-- keep ref in sync
      setCsvRows(csvRowsRef.current);
      setCsvContent(csvRowsRef.current);
      return;
    }

    // iOS & ANDROID
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      const existing = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
      await FileSystem.writeAsStringAsync(path, existing + row, { encoding: 'utf8' });
    } else {
      await FileSystem.writeAsStringAsync(path, row, { encoding: 'utf8' });
    }

  } catch (error) {
    console.error('Error writing CSV:', error);
    Alert.alert('Error', 'Failed to write data.');
  }
}

async function readCSV() {
  try {
    // WEB
    if (Platform.OS === 'web') {
      setCsvContent(csvRows);
      return;
    }

    // iOS & ANDROID
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) return;
    const content = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
    setCsvContent(content);

  } catch (error) {
    console.error('Error reading CSV:', error);
    Alert.alert('Error', 'Failed to read data.');
  }
}

  async function exportCSV() {
    try {
      // WEB
      if (Platform.OS === 'web') {
        if (!csvRowsRef.current) {           // <-- read from ref, always fresh
          alert("No CSV data to export.");
          return;
        }
        const blob = new Blob([csvRowsRef.current], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'scanned_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // iOS & ANDROID
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (!fileInfo.exists) {
        Alert.alert("No CSV file to export.");
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing not available on this device.");
        return;
      }

      // iOS
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(path, {
          mimeType: 'text/csv',
          dialogTitle: 'Share CSV File',
          UTI: 'public.comma-separated-values-text',
        });
      }

      // ANDROID
      if (Platform.OS === 'android') {
        await Sharing.shareAsync(path, {
          mimeType: 'text/csv',
          dialogTitle: 'Share CSV File',
        });
      }

    } catch (error) {
      console.error('Error sharing CSV file:', error);
      Alert.alert('Error', 'Failed to export the file.');
    }
  }

  async function clearCSV() {
  try {
    if (Platform.OS === 'web') {
      csvRowsRef.current = "";             // <-- keep ref in sync
      setCsvRows("");
      setCsvContent("");
      setScannedData("");
      return;
    }

    // iOS & ANDROID
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (fileInfo.exists) {
      await FileSystem.writeAsStringAsync(path, "", { encoding: "utf8" });
    }
    setCsvContent("");
    setScannedData("");

  } catch (error) {
    console.error('Error clearing CSV:', error);
    Alert.alert('Error', 'Failed to clear the file.');
  }
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
  container: {
    flex: 1,
  },
  camera: {
    flex: 3,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  data: {
    fontSize: 16,
    marginBottom: 20,
    color: '#FFFFFF',
  },
});