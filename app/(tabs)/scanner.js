import { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet, ScrollView } from "react-native";
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
// gets camera permission
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
  const row = data + '\n';

  const fileInfo = await FileSystem.getInfoAsync(path);

  if (fileInfo.exists) {
    // read existing file
    const existing = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });

    // write back with new row appended
    await FileSystem.writeAsStringAsync(path, existing + row, { encoding: 'utf8' });
  } else {
    // create file with first row
    await FileSystem.writeAsStringAsync(path, row, { encoding: 'utf8' });
  }
}

async function readCSV() {
  const content = await FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
  setCsvContent(content);
}

async function exportCSV() {
  if (!(await Sharing.isAvailableAsync())) {
    alert("Sharing not available");
    return;
  }

  await Sharing.shareAsync(path);
}

async function clearCSV() {
  const fileInfo = await FileSystem.getInfoAsync(path);

  if (fileInfo.exists) {
    await FileSystem.writeAsStringAsync(path, "", { encoding: "utf8" });
  }

  setCsvContent("");
  setScannedData("");
}

  // this function runs when a QR code is scanned, it sets the scanned state to true and stores the scanned data in scannedData
  const handleBarcodeScanned = ({ data }) => {
    setScanned(true);
    console.log("SCANNED:", data);
    setScannedData(data);
    writeCSV(data); // append the scanned data to the CSV file
    readCSV(); // read the CSV file to verify the data was written correctly
  };

  return (
    <View style={styles.container}>
  <CameraView
    style={styles.camera}
    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
  />

  <ScrollView style={{ flex: 1 }}
  contentContainerStyle={{
    justifyContent: "center",
    alignItems: "center"
  }}>
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
    color: '#ffffff',
  },

  data: {
    fontSize: 16,
    marginBottom: 20,
    color: '#ffffff',
  },
});