import { Image } from 'expo-image';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import QRCode from 'react-native-qrcode-svg';


export default function pitScreen() { //function runs everytime something changes
  //stores all the data from the intro screen
  const [scoutingData, setScoutingData] = useState({
    sizeOfHoppper: 0,
    typeOfShooter: 0,
    possibleClimbs: [],
    travel: [],
    intake: [],
    pitNotes: '',
  });

  const possibleClimbOptions = ['No Climb', 'Level 1', 'Level 2', 'Level 3'];
  const travelOptions = ['Bump', 'Trench'];
  const intakeOptions = ['Ground', 'Outpost'];
  const [submittedText, setSubmittedText] = useState(''); // final data set
  const [submittedTextCSV, setSubmittedTextCSV] = useState('');
  const [showQRCSV, setShowQRCSV] = useState(false);

  // Add this above your HomeScreen function
const RadioGroup = ({ options, selected, onSelect }) => (
  <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8, flexWrap: 'wrap' }}>
    {options.map((option) => (
      <TouchableOpacity
        key={option}
        onPress={() => onSelect(option)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <View style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: 'purple',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {selected === option && (
            <View style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: 'purple',
            }} />
          )}
        </View>
        <ThemedText style={{ color: '#000' }}>{option}</ThemedText>
      </TouchableOpacity>
    ))}
  </View>
);

const toggleIntakeLocation = (option) => {
  const current = scoutingData.intakeLocations;
  const updated = current.includes(option)
    ? current.filter(item => item !== option)  // remove if already selected
    : [...current, option];                     // add if not selected
  setScoutingData({ ...scoutingData, intakeLocations: updated });
};

  const handleSubmit = () => {

    setSubmittedText(JSON.stringify(scoutingData));

    // takes out all the values from scoutingData and joins them with commas to create a csv string
    const values = Object.values(scoutingData);
    const csv = values.join(","); // converts scoutingData to csv format, for example: "John Doe,1,1234,Left"

    setSubmittedTextCSV(csv); // sets the csv string to submittedTextCSV, which is used to generate the QR code

    setShowQRCSV(true); // shows the QR code, which is hidden by default, after the submit button is pressed
  };
  


  return (
    
   <ParallaxScrollView
   
  headerBackgroundColor={{ dark: '#663399' }}
  headerHeight={300} // controls the scrollable header height
  headerImage={
    <Image
      source={require('../images/mergelogo.jpg')}
      style={{
        width: '100%',           // full width of the screen
        aspectRatio: 1.5,        // adjust to your image's width/height ratio
        resizeMode: 'contain',   // keeps entire image visible
      }}
    />
  }
>
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>

      <ThemedView style={styles.stepContainer}>
        
        <ThemedText style={styles.titleContainer}>Pit Scouting</ThemedText>
        
        <ThemedText style={{ color: '#000' }}>Size of Hopper (# of fuel):</ThemedText>
        <TextInput value={scoutingData.sizeOfHopper} 
                  // changes string input to int, if input is empty or not a number, sets matchNumber to 0
                  onChangeText={(input) =>
                  setScoutingData({ ...scoutingData, sizeOfHopper: parseInt(input) || 0 })}
                  style={{ height: 50, borderColor: 'purple', borderWidth: 2}} />
        
        <ThemedText style={{ color: '#000' }}>Type of Shooter (1 for single, 2 for dual, 3 for triple):</ThemedText>
        <TextInput value={scoutingData.typeOfShooter} 
                  // changes string input to int, if input is empty or not a number, sets matchNumber to 0
                  onChangeText={(input) =>
                  setScoutingData({ ...scoutingData, typeOfShooter: parseInt(input) || 0 })}
                  style={{ height: 50, borderColor: 'purple', borderWidth: 2}} />

          <ThemedText style={{ color: '#000' }}>Climb:</ThemedText>

              <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
                  {possibleClimbOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        const selected = scoutingData.possibleClimbs;

                        if (selected.includes(option)) {
                          setScoutingData({
                            ...scoutingData,
                            possibleClimbs: selected.filter((item) => item !== option),
                          });
                        } else {
                          setScoutingData({
                            ...scoutingData,
                            possibleClimbs: [...selected, option],
                          });
                        }
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {/* Outer circle */}
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderWidth: 2,
                          borderColor: 'purple',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Filled circle if selected */}
                        {scoutingData.possibleClimbs.includes(option) && (
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: 'purple',
                            }}
                          />
                        )}
                      </View>

                      <ThemedText style={{ color: '#000' }}>{option}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>


          <ThemedText style={{ color: '#000' }}>Travel:</ThemedText>

          <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
                  {travelOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        const selected = scoutingData.travel;

                        if (selected.includes(option)) {
                          setScoutingData({
                            ...scoutingData,
                            travel: selected.filter((item) => item !== option),
                          });
                        } else {
                          setScoutingData({
                            ...scoutingData,
                            travel: [...selected, option],
                          });
                        }
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {/* Outer circle */}
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderWidth: 2,
                          borderColor: 'purple',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Filled circle if selected */}
                        {scoutingData.travel.includes(option) && (
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: 'purple',
                            }}
                          />
                        )}
                      </View>

                      <ThemedText style={{ color: '#000' }}>{option}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>


              <ThemedText style={{ color: '#000' }}>Intake:</ThemedText>

                <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
                  {intakeOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        const selected = scoutingData.intake;

                        if (selected.includes(option)) {
                          setScoutingData({
                            ...scoutingData,
                            intake: selected.filter((item) => item !== option),
                          });
                        } else {
                          setScoutingData({
                            ...scoutingData,
                            intake: [...selected, option],
                          });
                        }
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {/* Outer circle */}
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderWidth: 2,
                          borderColor: 'purple',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Filled circle if selected */}
                        {scoutingData.intake.includes(option) && (
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              backgroundColor: 'purple',
                            }}
                          />
                        )}
                      </View>

                      <ThemedText style={{ color: '#000' }}>{option}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>


        <ThemedText style={{ color: '#000' }}>Notes:</ThemedText>
                <TextInput value={scoutingData.pitNotes} 
                  onChangeText={(input) =>
                  setScoutingData({ ...scoutingData, pitNotes: input })
                  } 
                  style={{ height: 50, borderColor: 'purple', borderWidth: 2}} />

        
        

      </ThemedView>
       <Button title="Submit" onPress={handleSubmit} />
        {/* prints submittedText */}
        <Text style={{ marginTop: 20, color: '#000' }}>You submitted: {submittedText} </Text>

  {showQRCSV && submittedTextCSV !== '' && (
  
  <View style={styles.qrContainer}>
    <ThemedText style={{color: '#000', marginBottom: 10}}>For Scanner:</ThemedText>
    <QRCode 
      value={submittedTextCSV}  // only one value prop
      size={400}                // only one size prop
      color="black"
      backgroundColor="white"
    />
  </View>)}

    </SafeAreaView>
    </ParallaxScrollView>
  );
}



const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    color: '#000',
    fontSize: 24,
    marginBottom: 20,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 100,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  container:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  }
});





