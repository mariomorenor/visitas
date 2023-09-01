<template>
  <ion-page>

    <ion-content v-show="showCamera" :fullscreen="true">
      <ion-card>
        <ion-card-content class="cam-container">
          <qrcode-stream :paused="paused" @detect="onDetect"></qrcode-stream>
        </ion-card-content>
      </ion-card>
      <ion-item>
        <ion-label>
          <p>Visitante</p>
          <h1 v-text="visitor?.nombre"></h1>
          <p>
            <strong>Cédula: </strong>
            <span v-text="visitor?.cedula"></span>
          </p>
          <p>
            <strong>Correo: </strong>
            <span v-text="visitor?.correo"></span>
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <h3>Accesso</h3>
          <p>
            <strong>Fecha Inicio: </strong>
            <span v-text="data?.fecha_inicio"></span>
          </p>
          <p>
            <strong>Fecha Fin: </strong>
            <span v-text="data?.fecha_fin"></span>
          </p>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label>
          <p>Destino</p>
          <h2 v-text="data?.receptor"></h2>
          <p>
            <strong>Departamento: </strong><br>
            <span v-text="data?.departamento"></span>
          </p>
          <p>
            <strong>Motivo: </strong><br>
            <span v-text="data?.motivo"></span>
          </p>

        </ion-label>
      </ion-item>
      <ion-item>
        <div class="access">
          <ion-chip v-if="isAuthorized == AccessStatus.authorized">INGRESO AUTORIZADO</ion-chip>
          <div v-if="isAuthorized == AccessStatus.unauthorized">
            <ion-chip class="unauthorized">INGRESO NO AUTORIZADO</ion-chip>
            <br>
            <ion-text color="danger">Código QR Inválido</ion-text>
          </div>
        </div>
        <ion-progress-bar v-if="isAuthorized == AccessStatus.pending" type="indeterminate"></ion-progress-bar>

      </ion-item>
    </ion-content>
    <ion-content v-show="!showCamera">
      <div class="main">
        <ion-button @click="startScan()">Iniciar Scan</ion-button>
      </div>
      <footer>
        <div class="footer-container">
          <ion-text color="medium">
            <small>Desarrollado en DTI - PUCESD por Ing. Jonathan Moreno</small>
          </ion-text>
          <!-- <small>Desarrollado en DTI - PUCESD por Jonathan Moreno</small> -->
        </div>
      </footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { IonContent, IonCard, IonCardContent, IonPage, IonItem, IonLabel, IonChip, IonProgressBar, IonButton, IonText } from '@ionic/vue';
import { ref } from 'vue';
import moment from "moment"

// ****** Type Definitions *****
type DecodedMessage = {
  departamento: string,
  fecha_inicio: Date | null,
  fecha_fin: Date | null,
  motivo: string,
  receptor: string,
  visitante: Visitor
}

type Visitor = {
  nombre: string,
  cedula: string,
  correo: string
}

enum AccessStatus {
  authorized,
  unauthorized,
  pending
}

// **** Variables *****
const visitor = ref<Visitor>()
const data = ref<DecodedMessage>()
const isAuthorized = ref<AccessStatus>(AccessStatus.pending)
const timeToResetGUI = 10 //Time in seconds
const showCamera = ref<Boolean>(false);
var resetGUIInterval: NodeJS.Timeout;
const timeToResetCam = 20;
var resetCamInterval: NodeJS.Timeout;
var paused = ref(false)


// ***** Functions *****

async function onDetect(detectedCode: any) {
  try {
    clearInterval(resetGUIInterval)
    clearInterval(resetCamInterval)

    // const message_encoded = atob(detectedCode[0].rawValue)
    const message_encoded = decodeURIComponent(escape(atob(detectedCode[0].rawValue)))

    data.value = JSON.parse(message_encoded.replaceAll("'", '"'))
    console.log(data);

    visitor.value = data.value?.visitante

    isAuthorized.value = checkAccess();

  } catch (error) {
    isAuthorized.value = AccessStatus.unauthorized
  }
  resetGUIInterval = setTimeout(() => {
    resetGUI();
  }, timeToResetGUI * 1000);

  resetCamInterval = setTimeout(() => {
    showCamera.value = false;
  }, timeToResetCam * 1000)

  paused.value = true;
  setTimeout(() => {
    paused.value = false;
  }, 1);
}

function checkAccess() {
  let today = moment()
  let fecha_inicio = moment(data.value?.fecha_inicio)
  let fecha_fin = moment(data.value?.fecha_fin)

  if (fecha_fin && (today >= fecha_inicio && today <= fecha_fin)) {
    return AccessStatus.authorized;
  }

  if (today >= fecha_inicio) {
    return AccessStatus.authorized;
  }


  return AccessStatus.unauthorized;

}

function resetGUI() {
  isAuthorized.value = AccessStatus.pending
  visitor.value = {
    nombre: "",
    cedula: "",
    correo: ""
  }
  data.value = {
    departamento: "",
    fecha_fin: null,
    fecha_inicio: null,
    motivo: "",
    visitante: visitor.value,
    receptor: ""
  }
}

function startScan() {
  showCamera.value = true;

  resetCamInterval = setTimeout(() => {
    showCamera.value = false;
  }, timeToResetCam * 1000)

}



</script>

<style scoped>
.scann-container {
  margin-left: auto;
  margin-right: auto;
  margin-top: 5%;
  width: 75vw;
}

.unauthorized {
  --background: #df0000;
  --color: white;
}

ion-chip {
  --background: #00A0DF;
  --color: white;
}

.access {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.cam-container {
  max-height: 40vh;
}

.main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

footer {
  position: absolute;
  width: 100%;
  bottom: 1%;
}

.footer-container {
  margin-left: auto;
  margin-right: auto;
  color: #777777;
  text-align: center;
}
</style>
