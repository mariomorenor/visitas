<template>
  <ion-page>

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-content  class="cam-container">
          <div>
            <qrcode-stream @detect="onDetect"></qrcode-stream>
          </div>
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
          <ion-chip class="unauthorized" v-if="isAuthorized == AccessStatus.unauthorized">INGRESO NO AUTORIZADO</ion-chip>
        </div>
        <ion-progress-bar v-if="isAuthorized == AccessStatus.pending" type="indeterminate"></ion-progress-bar>

      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { IonContent, IonCard, IonCardContent, IonPage, IonItem, IonLabel, IonChip, IonProgressBar } from '@ionic/vue';
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
var resetInterval: NodeJS.Timeout;

// ***** Functions *****

async function onDetect(detectedCode: any) {
  clearInterval(resetInterval)
  // const message_encoded = atob(detectedCode[0].rawValue)
  const message_encoded = decodeURIComponent(escape(atob(detectedCode[0].rawValue)))

  data.value = JSON.parse(message_encoded.replaceAll("'", '"'))
  console.log(data);

  visitor.value = data.value?.visitante

  isAuthorized.value = checkAccess();


  resetInterval = setTimeout(() => {
    resetGUI();
  }, timeToResetGUI * 1000)

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
}

.cam-container{
  max-height: 40vh;
}
</style>
