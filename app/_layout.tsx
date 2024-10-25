import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import {
  initializeDatabase,
  createTable,
  getSavedLocation,
} from "../databases/location/database";
import { getLocation } from "../appServices/location";

export const LocationScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      await createTable();
    };
    initDB();
  }, []);

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    const apiKey = "SUA_CHAVE_OPENCAGE"; // Coloque sua chave de API aqui
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

    setTimeout(() => {
      console.log(
        "Timeout de 3 segundos atingido. Usando a localização salva."
      );
    }, 3000);

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted; // Retorna o endereço formatado
      } else {
        console.log(
          "Nenhum endereço encontrado para as coordenadas fornecidas."
        );
        return null;
      }
    } catch (error) {
      console.error("Erro ao obter endereço:", error);
      return null;
    }
  };

  const handleGetCurrentLocation = async () => {
    const currentLocation = await getLocation();
    if (currentLocation) {
      setLocation(currentLocation);
      const fetchedAddress = await getAddressFromCoordinates(
        currentLocation.latitude,
        currentLocation.longitude
      );
      setAddress(fetchedAddress);
    } else {
      setErrorMsg(
        "Não foi possível obter a localização atual ou usar a última salva."
      );
    }
  };

  const handleGetSavedLocation = async () => {
    await getSavedLocation(async (savedLocation) => {
      if (savedLocation) {
        setLocation(savedLocation);
        const fetchedAddress = await getAddressFromCoordinates(
          savedLocation.latitude,
          savedLocation.longitude
        );
        setAddress(fetchedAddress);
      } else {
        setErrorMsg("Nenhuma localização salva encontrada.");
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Localização</Text>
      <Button
        title="Pegar Localização Atual"
        onPress={handleGetCurrentLocation}
      />
      <Button
        title="Pegar Localização Salva"
        onPress={handleGetSavedLocation}
        style={styles.buttonSpacing}
      />
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      {location ? (
        <View style={styles.locationContainer}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          {location.timestamp && <Text>Timestamp: {location.timestamp}</Text>}
          {address && <Text>Endereço: {address}</Text>}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  buttonSpacing: {
    marginTop: 16,
  },
  errorText: {
    color: "red",
    marginTop: 16,
  },
  locationContainer: {
    marginTop: 16,
  },
});

export default LocationScreen;
