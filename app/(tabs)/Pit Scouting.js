import { Image } from 'expo-image';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import QRCode from 'react-native-qrcode-svg';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';


// ✅ Reusable CheckboxGroup
const CheckboxGroup = ({ options, selectedValues, onToggle }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 8 }}>
    {options.map((option) => {
      const isSelected = selectedValues.includes(option);

      return (
        <TouchableOpacity
          key={option}
          onPress={() => onToggle(option)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 2,
            borderColor: 'purple',
            borderRadius: 8,
            backgroundColor: isSelected ? 'purple' : 'white',
          }}
        >
          <Text style={{ color: isSelected ? 'white' : 'black' }}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);


export default function PitScreen() {

  const [scoutingData, setScoutingData] = useState({
    teamNumber: 0,
    sizeOfHopper: 0,
    typeOfShooter: 0,
    driveTrain: '',
    possibleClimbs: [],
    possibleShootingLocations: [],
    travel: [],
    intake: [],
    pitNotes: '',
  });

  const [submittedTextCSV, setSubmittedTextCSV] = useState('');
  const [showQRCSV, setShowQRCSV] = useState(false);

  // Options
  const possibleClimbOptions = ['No Climb', 'Level 1', 'Level 2', 'Level 3'];
  const travelOptions = ['Bump', 'Trench'];
  const intakeOptions = ['Ground', 'Outpost'];
  const shootingOptions = [
    'Against Hub',
    'From Trench',
    'From Corners',
    'Against Tower',
    'Anywhere in alliance zone'
  ];

  // Handlers
  const handleMultiSelect = (field, value) => {
    const current = scoutingData[field];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setScoutingData({ ...scoutingData, [field]: updated });
  };

  // CSV ORDER
  const fieldOrder = [
    'teamNumber',
    'sizeOfHopper',
    'typeOfShooter',
    'driveTrain',
    'possibleClimbs',
    'possibleShootingLocations',
    'travel',
    'intake',
    'pitNotes',
  ];

  const handleSubmit = () => {
    const values = fieldOrder.map((key) => {
      const value = scoutingData[key];
      return Array.isArray(value) ? value.join('|') : value;
    });

    const csv = values.join(',');

    setSubmittedTextCSV(csv);
    setShowQRCSV(true);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ dark: '#663399' }}
      headerHeight={300}
      headerImage={
        <Image
          source={require('../images/mergelogo.jpg')}
          style={{
            width: '100%',
            aspectRatio: 1.5,
            resizeMode: 'contain',
          }}
        />
      }
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

        <ThemedView style={styles.stepContainer}>
          <ThemedText style={styles.title}>Pit Scouting</ThemedText>

          {/* TEAM NUMBER */}
          <ThemedText style={styles.label}>Team Number:</ThemedText>
          <TextInput
            keyboardType="numeric"
            value={scoutingData.teamNumber.toString()}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, teamNumber: parseInt(input) || 0 })
            }
            style={styles.input}
          />

          {/* HOPPER */}
          <ThemedText style={styles.label}>Size of Hopper (# of fuel it can hold):</ThemedText>
          <TextInput
            keyboardType="numeric"
            value={scoutingData.sizeOfHopper.toString()}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, sizeOfHopper: parseInt(input) || 0 })
            }
            style={styles.input}
          />

          {/* SHOOTER */}
          <ThemedText style={styles.label}>Type of Shooter (1 for single, 2 for dual, etc.):</ThemedText>
          <TextInput
            keyboardType="numeric"
            value={scoutingData.typeOfShooter.toString()}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, typeOfShooter: parseInt(input) || 0 })
            }
            style={styles.input}
          />

          {/* DRIVETRAIN */}
          <ThemedText style={styles.label}>Drivetrain:</ThemedText>
          <TextInput
            placeholder="e.g. Swerve, Tank"
            value={scoutingData.driveTrain}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, driveTrain: input })
            }
            style={styles.input}
          />

          {/* CLIMB */}
          <ThemedText style={styles.label}>Climb:</ThemedText>
          <CheckboxGroup
            options={possibleClimbOptions}
            selectedValues={scoutingData.possibleClimbs}
            onToggle={(option) => handleMultiSelect('possibleClimbs', option)}
          />

          {/* SHOOTING */}
          <ThemedText style={styles.label}>Shooting Locations:</ThemedText>
          <CheckboxGroup
            options={shootingOptions}
            selectedValues={scoutingData.possibleShootingLocations}
            onToggle={(option) => handleMultiSelect('possibleShootingLocations', option)}
          />

          {/* TRAVEL */}
          <ThemedText style={styles.label}>Travel:</ThemedText>
          <CheckboxGroup
            options={travelOptions}
            selectedValues={scoutingData.travel}
            onToggle={(option) => handleMultiSelect('travel', option)}
          />

          {/* INTAKE */}
          <ThemedText style={styles.label}>Intake:</ThemedText>
          <CheckboxGroup
            options={intakeOptions}
            selectedValues={scoutingData.intake}
            onToggle={(option) => handleMultiSelect('intake', option)}
          />

          {/* NOTES */}
          <ThemedText style={styles.label}>Notes:</ThemedText>
          <TextInput
            value={scoutingData.pitNotes}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, pitNotes: input })
            }
            style={styles.input}
          />

          {/* SUBMIT */}
          <Button title="Submit" color="purple" onPress={handleSubmit} />

          {/* QR */}
          {showQRCSV && submittedTextCSV !== '' && (
            <View style={styles.qrContainer}>
              <ThemedText style={{ color: '#000', marginBottom: 10 }}>
                Scan to Export CSV
              </ThemedText>
              <QRCode value={submittedTextCSV} size={300} />
            </View>
          )}

          <Text style={{ marginTop: 20, color: '#000' }}>
            {submittedTextCSV}
          </Text>

        </ThemedView>

      </SafeAreaView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: 'purple',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 20,
    color: '#000',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
  },
});