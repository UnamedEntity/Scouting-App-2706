import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
    alliance: [],
    position: [],
    teamNumber: 0,
    startLocation: '',
    shooterScale: 1,
    accuracyScale: 1,
    defenseScale: 1,
    shootingLocationTeleop: '',
    shootLocationAuto: '',
    bump: false,
    trench: false,
    intakeLocation: [],
    inactivePeriod: '',
    actualClimb: '',
    typeOfRobot: [],
    endNotes: '',
    autoMortality: false,
    teleopMortality: false,
    underTrench: false,
    overBump: false,
    climbOptions: '',
    autoPath: '',
    autoNotes: '',
    intakeLocations: [],
    penaltyPoints: 0,
    penaltyNotes: '',
  });

  useEffect(() => {
  const fetchTeam = async () => {
    if (!scoutingData.matchNumber || !scoutingData.alliance.length || !scoutingData.position.length) return;

    const eventKey = '2024nyny'; // ← change this to your event key
    const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`, {
      headers: { 'X-TBA-Auth-Key': process.env.EXPO_PUBLIC_TBA_API_KEY }
    });
    const matches = await res.json();

    const match = matches.find(m => m.match_number === scoutingData.matchNumber && m.comp_level === 'qm');
    if (!match) return;

    const alliance = scoutingData.alliance[0].toLowerCase();
    const positionIndex = parseInt(scoutingData.position[0]) - 1;
    const teamKey = match.alliances[alliance].team_keys[positionIndex];
    const teamNumber = parseInt(teamKey.replace('frc', ''));

    setScoutingData(prev => ({ ...prev, teamNumber }));
  };

  fetchTeam();
}, [scoutingData.matchNumber, scoutingData.alliance, scoutingData.position]);

  const [submittedText, setSubmittedText] = useState('');
  const [submittedTextCSV, setSubmittedTextCSV] = useState('');
  const [showQRCSV, setShowQRCSV] = useState(false);

  // Options
  const allianceOptions = ['Red', 'Blue'];
  const positionOptions = ['1', '2', '3'];
  const startLocationOptions = ['At Hub', 'Depot Side Trench', 'Outpost Side Trench', 'Depot Side Bump', 'Outpost Side Bump'];
  const intakeOptions = ['Ground', 'Outpost'];
  const intakeLocationsOptions = ['Outpost', 'Depot', 'Neutral'];
  const typeOfRobotOptions = ['Defense', 'Shooter', 'Feeder'];
  const finalClimbOptions = ['No Climb', 'Attempted Climb but Failed', 'Level 1', 'Level 2', 'Level 3'];
  const climbOptions = ['Did Not Attempt', 'Attempted Climb but Failed', 'Climb Succesful'];

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
  
  const fieldOrder = [
    'nameOfScout',
    'matchNumber',
    'teamNumber',

    // AUTO
    'startLocation',
    'autoMortality',
    'underTrench',
    'overBump',
    'intakeLocations',
    'shootLocationAuto',
    'climbOptions',
    'autoPath',
    'autoNotes',

    // TELEOP
    'shooterScale',
    'accuracyScale',
    'shootingLocationTeleop',
    'teleopMortality',
    'bump',
    'trench',
    'intakeLocation',
    'inactivePeriod',

    // ENDGAME
    'actualClimb',
    'typeOfRobot',
    'defenseScale',
    'penaltyPoints',
    'penaltyNotes',
    'endNotes',
  ]

  const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';

  let stringValue = String(value);

  // Escape double quotes by doubling them
  stringValue = stringValue.replace(/"/g, '""');

  // Wrap in quotes if it contains comma, newline, or quotes
  if (/[",\n]/.test(stringValue)) {
    stringValue = `"${stringValue}"`;
  }

  return stringValue;
};

  const handleClear = () => {
    setScoutingData({
      matchNumber: 0,
      teamNumber: 0,
      alliance: [],
      position: [],
      startLocation: '',
      shooterScale: 1,
      accuracyScale: 1,
      defenseScale: 1,
      shootingLocationTeleop: '',
      shootLocationAuto: '',
      bump: false,
      trench: false,
      intakeLocation: [],
      inactivePeriod: '',
      actualClimb: '',
      typeOfRobot: [],
      endNotes: '',
      autoMortality: false,
      teleopMortality: false,
      underTrench: false,
      overBump: false,
      climbOptions: '',
      autoPath: '',
      autoNotes: '',
      intakeLocations: [],
      penaltyPoints: 0,
      penaltyNotes: '',
    });
  };


  const handleSubmit = async () => {
    setSubmittedText(JSON.stringify(scoutingData));

    try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(scoutingData),
    });

    const result = await response.json();

    if (result.status === "success") {
      console.log("Submitted!");
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }

  const values = fieldOrder.map((key) => {
  const value = scoutingData[key];
  const processed = Array.isArray(value) ? value.join('|') : value;
  return escapeCSV(processed);});

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

          <ThemedText style={styles.label}>Alliance:</ThemedText>
          <CheckboxGroup
            options={allianceOptions}
            selectedValues={scoutingData.alliance}
            onToggle={(option) => handleSingleSelect('alliance', option)}
          />

          <ThemedText style={styles.label}>Position:</ThemedText>
          <CheckboxGroup
            options={positionOptions}
            selectedValues={scoutingData.position}
            onToggle={(option) => handleSingleSelect('position', option)}
          />

          <ThemedText style={styles.label}>Team Number:</ThemedText>
          <TextInput
              value={scoutingData.teamNumber.toString()}
              editable={false}
              style={[styles.input, { backgroundColor: '#f0f0f0' }]}
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

          <ThemedText style={styles.label}>Dead?</ThemedText>
          <CheckboxGroup
            options={['Yes']}
            selectedValues={scoutingData.autoMortality ? ['Yes'] : []}
            onToggle={() => setScoutingData({ ...scoutingData, autoMortality: !scoutingData.autoMortality })}
          />
          

          <ThemedText style={styles.label}>Under Trench:</ThemedText>
          <CheckboxGroup
            options={['Yes']}
            selectedValues={scoutingData.underTrench ? ['Yes'] : []}
            onToggle={() => setScoutingData({ ...scoutingData, underTrench: !scoutingData.underTrench })}
          />

          <ThemedText style={styles.label}>Over Bump:</ThemedText>
          <CheckboxGroup
            options={['Yes']}
            selectedValues={scoutingData.overBump ? ['Yes'] : []}
            onToggle={() => setScoutingData({ ...scoutingData, overBump: !scoutingData.overBump })}
          />
        
        <ThemedText style={styles.label}>Intake:</ThemedText>
          <CheckboxGroup
            options={intakeLocationsOptions}
            selectedValues={scoutingData.intakeLocations}
            onToggle={(option) => handleMultiSelect('intakeLocations', option)}
          />

           <ThemedText style={styles.label}>Shooting Location(s):</ThemedText>
          <TextInput
            placeholder="e.g., Against Hub, From Trench"
            value={scoutingData.shootLocationAuto}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, shootLocationAuto: input})
            }
            style={styles.input}
          />

          <ThemedText style={styles.label}>Climb?:</ThemedText>
          <CheckboxGroup
            options={climbOptions}
            selectedValues={[scoutingData.climbOptions].filter(Boolean)}
            onToggle={(option) => handleSingleSelect('climbOptions', option)}
          />

          <ThemedText style={styles.label}>Describe the Auto Path:</ThemedText>
          <TextInput
            placeholder='eg. shot 8 fuel, intook from alliance zone'
            value={scoutingData.autoPath}
            onChangeText={(input) => setScoutingData({ ...scoutingData, autoPath: input })}
            style={styles.input}
          />

          <ThemedText style={styles.label}>Any Auto Notes?:</ThemedText>
          <TextInput
            placeholder='eg. shooter was inaccurate'
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

          <ThemedText style={styles.label}>Shooting Location(s):</ThemedText>
          <TextInput
            placeholder="e.g., Against Hub, From Trench"
            value={scoutingData.shootingLocationTeleop}
            onChangeText={(input) =>
              setScoutingData({ ...scoutingData, shootingLocationTeleop: input, shootingLocationTeleop: input })
            }
            style={styles.input}
          />

        <ThemedText style={styles.label}>Dead?</ThemedText>
          <CheckboxGroup
            options={['Yes']}
            selectedValues={scoutingData.teleopMortality ? ['Yes'] : []}
            onToggle={() => setScoutingData({ ...scoutingData, teleopMortality: !scoutingData.teleopMortality })}
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

          <ThemedText style={styles.label}>Describe their Inactive Period(s):</ThemedText>
          <TextInput
            placeholder='eg. feeding fuel to alliance zone, defense'
            value={scoutingData.inactivePeriod}
            onChangeText={(input) => setScoutingData({ ...scoutingData, inactivePeriod: input })}
            style={styles.input}
          />

        <ThemedText style={styles.titleContainer}>End Game</ThemedText>

            {/* END GAME */}
          <ThemedText style={styles.label}>Climb?:</ThemedText>
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

          <ThemedText style={styles.label}>If they played defense, how good were they?:</ThemedText>
          <CheckboxGroup
            options={[1, 2, 3, 4, 5].map(String)}
            selectedValues={[scoutingData.defenseScale.toString()]}
            onToggle={(option) => handleSingleSelect('defenseScale', parseInt(option))}
          />

       <ThemedText style={styles.label}>Penalty Points:</ThemedText>
          <TextInput
            keyboardType="numeric"
            value={scoutingData.penaltyPoints.toString()}
            onChangeText={(input) => setScoutingData({ ...scoutingData, penaltyPoints: parseInt(input) || 0 })}
            style={styles.input}
          />


        <ThemedText style={styles.label}>Penalty?:</ThemedText>
          <TextInput
          placeholder='Indicate reason for penalty'
            value={scoutingData.penaltyNotes}
            onChangeText={(input) => setScoutingData({ ...scoutingData, penaltyNotes: input })}
            style={styles.input}
          />


          <ThemedText style={styles.label}>Any Final Notes?:</ThemedText>
          <TextInput
            placeholder='eg. robot was very slow, but climbed well'
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

          <ThemedText style={{ marginTop: 20, color: '#000' }}>You submitted: {submittedTextCSV}</ThemedText>

          <Button title="Clear" color="purple" onPress={handleClear} />


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