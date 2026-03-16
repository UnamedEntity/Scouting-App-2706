import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Button, TextInput, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Reusable CheckboxGroup
const CheckboxGroup = ({ options, selectedValues, onToggle }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 8 }}>
    {options.map((option) => {
      const isSelected = Array.isArray(selectedValues)
        ? selectedValues.includes(option)
        : selectedValues === option;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onToggle(option)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderWidth: 2,
            borderColor: 'purple',
            backgroundColor: isSelected ? 'purple' : 'white',
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <ThemedText style={{ color: isSelected ? 'white' : 'black' }}>{option}</ThemedText>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function HomeScreen() {
  const [scoutingData, setScoutingData] = useState({
    // First program fields
    nameOfScout: '',
    matchNumber: 0,
    teamNumber: 0,
    startLocation: '',
    shooterScale: 1,
    accuracyScale: 1,
    shootLocation: '',
    bump: false,
    trench: false,
    intakeLocation: [],
    inactivePeriod: '',
    // Second program fields
    sizeOfHoppper: 0,
    typeOfShooter: 0,
    possibleClimbs: [],
    travel: [],
    intake: [],
    pitNotes: '',
    actualClimb: '',
    typeOfRobot: [],
    endNotes: '',
    autoMortality: '',
    shootingLocation: '',
    underTrench: '',
    overBump: '',
    climbOptions: '',
    autoPath: '',
    autoNotes: '',
    intakeLocations: [],
  });

  const [submittedText, setSubmittedText] = useState('');
  const [submittedTextCSV, setSubmittedTextCSV] = useState('');
  const [showQRCSV, setShowQRCSV] = useState(false);

  // Options
  const yesNoOptions = ['Yes', 'No'];
  const startLocationOptions = ['At Hub', 'Depot Side Trench', 'Outpost Side Trench', 'Depot Side Bump', 'Outpost Side Bump'];
  const intakeOptions = ['Ground', 'Outpost'];
  const intakeLocationsOptions = ['Outpost', 'Depot', 'Neutral'];
  const typeOfRobotOptions = ['Defense', 'Shooter', 'Feeder'];
  const finalClimbOptions = ['No Climb', 'Level 1', 'Level 2', 'Level 3'];
  const climbOptions = ['Level 1', 'Did not attempt climb', 'Attempted climb but failed'];
  const travelOptions = ['Bump', 'Trench'];

  // Handlers
  const handleSingleSelect = (field, value) => {
    setScoutingData({ ...scoutingData, [field]: value });
  };

  const handleMultiSelect = (field, value) => {
    const currentItems = [...scoutingData[field]];
    const index = currentItems.indexOf(value);
    if (index > -1) {
      currentItems.splice(index, 1);
    } else {
      currentItems.push(value);
    }
    setScoutingData({ ...scoutingData, [field]: currentItems });
  };

  const handleSubmit = () => {
    setSubmittedText(JSON.stringify(scoutingData));
    const values = Object.values(scoutingData).map((v) => (Array.isArray(v) ? v.join('|') : v));
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
          style={{ width: '100%', aspectRatio: 1.5, resizeMode: 'contain' }}
        />
      }
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ThemedView style={styles.stepContainer}>
          {/* First program inputs */}
          <ThemedText style={styles.label}>Name of Scout:</ThemedText>
          <TextInput
            value={scoutingData.nameOfScout}
            onChangeText={(input) => setScoutingData({ ...scoutingData, nameOfScout: input })}
            style={styles.input}
          />

          <ThemedText style={styles.label}>Match Number:</ThemedText>
          <TextInput
            keyboardType="numeric"
            value={scoutingData.matchNumber.toString()}
            onChangeText={(input) => setScoutingData({ ...scoutingData, matchNumber: parseInt(input) || 0 })}
            style={styles.input}
          />

          <ThemedText style={styles.label}>Team Number:</ThemedText>
          <TextInput
            keyboardType="numeric"
            value={scoutingData.teamNumber.toString()}
            onChangeText={(input) => setScoutingData({ ...scoutingData, teamNumber: parseInt(input) || 0 })}
            style={styles.input}
          />

          <Image source={require('../images/frc2026rebuiltmap.png')} style={{ width: '100%', height: 200, resizeMode: 'contain' }} />


        <ThemedText style={styles.titleContainer}>Auto</ThemedText>

        {/* AUTO INPUTS */}
          <ThemedText style={styles.label}>Start Location:</ThemedText>
          <CheckboxGroup
            options={startLocationOptions}
            selectedValues={[scoutingData.startLocation].filter(Boolean)}
            onToggle={(option) => handleSingleSelect('startLocation', option)}
          />


         <ThemedText style={styles.label}>Auto Mortality:</ThemedText>
          <CheckboxGroup
            options={yesNoOptions}
            selectedValues={[scoutingData.autoMortality].filter(Boolean)}
            onToggle={(option) => handleSingleSelect('autoMortality', option)}
          />

          <ThemedText style={styles.label}>Under Trench:</ThemedText>
          <CheckboxGroup
            options={yesNoOptions}
            selectedValues={[scoutingData.underTrench].filter(Boolean)}
            onToggle={(option) => handleSingleSelect('underTrench', option)}
          />

          <ThemedText style={styles.label}>Over Bump:</ThemedText>
          <CheckboxGroup
            options={yesNoOptions}
            selectedValues={[scoutingData.overBump].filter(Boolean)}
            onToggle={(option) => handleSingleSelect('overBump', option)}
          />
        
        <ThemedText style={styles.label}>Intake:</ThemedText>
          <CheckboxGroup
            options={intakeLocationsOptions}
            selectedValues={scoutingData.intake}
            onToggle={(option) => handleMultiSelect('intake', option)}
          />

          <ThemedText style={styles.label}>Climb Options:</ThemedText>
          <CheckboxGroup
            options={climbOptions}
            selectedValues={[scoutingData.climbOptions].filter(Boolean)}
            onToggle={(option) => handleSingleSelect('climbOptions', option)}
          />

          <ThemedText style={styles.label}>Auto Path:</ThemedText>
          <TextInput
            value={scoutingData.autoPath}
            onChangeText={(input) => setScoutingData({ ...scoutingData, autoPath: input })}
            style={styles.input}
          />

          <ThemedText style={styles.label}>Auto Notes:</ThemedText>
          <TextInput
            value={scoutingData.autoNotes}
            onChangeText={(input) => setScoutingData({ ...scoutingData, autoNotes: input })}
            style={styles.input}
          />

        <ThemedText style={styles.titleContainer}>Teleop</ThemedText>

        {/* TELEOP INPUTS */}
          <ThemedText style={styles.label}>Shooter Speed Scale (1-5):</ThemedText>
          <CheckboxGroup
            options={[1, 2, 3, 4, 5].map(String)}
            selectedValues={[scoutingData.shooterScale.toString()]}
            onToggle={(option) => handleSingleSelect('shooterScale', parseInt(option))}
          />

          <ThemedText style={styles.label}>Shooter Accuracy Scale (1-5):</ThemedText>
          <CheckboxGroup
            options={[1, 2, 3, 4, 5].map(String)}
            selectedValues={[scoutingData.accuracyScale.toString()]}
            onToggle={(option) => handleSingleSelect('accuracyScale', parseInt(option))}
          />

          <ThemedText style={styles.label}>Shooting Location:</ThemedText>
          <TextInput
            placeholder="e.g., Against Hub, From Trench"
            value={scoutingData.shootLocation || scoutingData.shootingLocation}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, shootLocation: input, shootingLocation: input })
            }
            style={styles.input}
          />

          <ThemedText style={styles.label}>Bump:</ThemedText>
          <CheckboxGroup
            options={['Yes']}
            selectedValues={scoutingData.bump ? ['Yes'] : []}
            onToggle={() => setScoutingData({ ...scoutingData, bump: !scoutingData.bump })}
          />

          <ThemedText style={styles.label}>Trench:</ThemedText>
          <CheckboxGroup
            options={['Yes']}
            selectedValues={scoutingData.trench ? ['Yes'] : []}
            onToggle={() => setScoutingData({ ...scoutingData, trench: !scoutingData.trench })}
          />

          <ThemedText style={styles.label}>Intake Locations:</ThemedText>
          <CheckboxGroup
            options={intakeOptions}
            selectedValues={scoutingData.intakeLocation}
            onToggle={(option) => handleMultiSelect('intakeLocation', option)}
          />

          <ThemedText style={styles.label}>Inactive Period:</ThemedText>
          <TextInput
            value={scoutingData.inactivePeriod}
            onChangeText={(input) => setScoutingData({ ...scoutingData, inactivePeriod: input })}
            style={styles.input}
          />

        <ThemedText style={styles.titleContainer}>End Game</ThemedText>

            {/* END GAME */}
          <ThemedText style={styles.label}>Actual Climb:</ThemedText>
          <CheckboxGroup
            options={finalClimbOptions}
            selectedValues={[scoutingData.actualClimb].filter(Boolean)}
            onToggle={(option) =>
              handleSingleSelect('actualClimb', scoutingData.actualClimb === option ? '' : option)
            }
          />

          <ThemedText style={styles.label}>Type of Robot:</ThemedText>
          <CheckboxGroup
            options={typeOfRobotOptions}
            selectedValues={scoutingData.typeOfRobot}
            onToggle={(option) => handleMultiSelect('typeOfRobot', option)}
          />

          <ThemedText style={styles.label}>End Notes:</ThemedText>
          <TextInput
            value={scoutingData.endNotes}
            onChangeText={(input) => setScoutingData({ ...scoutingData, endNotes: input })}
            style={styles.input}
          />

 

          {/* Submit & QR */}
          <Button title="Submit" color="purple" onPress={handleSubmit} />

          {showQRCSV && submittedTextCSV !== '' && (
            <View style={styles.qrContainer}>
              <ThemedText style={{ color: '#000', marginBottom: 10 }}>Scan to Export CSV</ThemedText>
              <QRCode value={submittedTextCSV} size={300} />
            </View>
          )}

          <ThemedText style={{ marginTop: 20, color: '#000' }}>You submitted: {submittedText}</ThemedText>
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
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  titleContainer: {
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginVertical: 10,
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