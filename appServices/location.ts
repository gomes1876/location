// locationService.ts

import * as Location from "expo-location";
import {
  saveLocation,
  getSavedLocation,
  Location as SavedLocation,
} from "../databases/location/database";

// Função para verificar permissão de localização
const getLocationPermission = async (): Promise<boolean> => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Permissão de localização negada.");
    return false;
  }
  return true;
};

// Função para obter a localização atual com timeout
export const getLocation = async (): Promise<SavedLocation | null> => {
  const hasPermission = await getLocationPermission();

  if (!hasPermission) {
    console.log("Permissão de localização não obtida.");
    return null;
  }

  // Promise com timeout de 3 segundos para obter a localização atual
  return new Promise<SavedLocation | null>((resolve) => {
    let timeoutReached = false;

    const timeout = setTimeout(() => {
      timeoutReached = true;
      console.log(
        "Timeout de 3 segundos atingido. Usando a última localização salva."
      );

      // Tenta retornar a última localização salva se o tempo estourar
      getSavedLocation((location) => {
        resolve(location);
      });
    }, 3000);

    Location.getCurrentPositionAsync({})
      .then((location) => {
        if (!timeoutReached) {
          clearTimeout(timeout); // Cancela o timeout se a localização for obtida a tempo
          const { latitude, longitude } = location.coords;
          console.log("Localização atual obtida:", latitude, longitude);
          saveLocation(latitude, longitude); // Salva no banco de dados local
          resolve({ latitude, longitude });
        }
      })
      .catch((error) => {
        if (!timeoutReached) {
          clearTimeout(timeout);
          console.log("Erro ao obter localização atual. Usando última salva.");
          getSavedLocation((location) => {
            resolve(location);
          });
        }
      });
  });
};
