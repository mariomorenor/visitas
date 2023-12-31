<script lang="ts" setup>
import { QrcodeStream } from 'vue-qrcode-reader'
import { IonContent, IonCard, IonCardContent, IonPage, IonItem, IonLabel, IonChip, IonProgressBar, IonText, IonImg, getPlatforms } from '@ionic/vue';
import { ref } from 'vue';
import moment from "moment";
import { CapacitorHttp as Http, HttpOptions, HttpResponse, CapacitorCookies } from '@capacitor/core';
// import { Http } from '@capacitor-community/http';

type DecodedMessage = {
    id: number,
    valido_hasta: Date | 0,
    estado: string
}

type Visitor = {
    nombre: string | undefined
}


enum AccessStatus {
    authorized,
    unauthorized,
    pending
}

var data = ref<DecodedMessage>();
var visitor = ref<Visitor>({ nombre: "" });
var valid_until = ref();
var isAuthorized = ref<AccessStatus>();

var intervalGUI: any;
const timeToReset = 5 //Seconds
const loading = ref(true);

var paused = ref("auto");

const server = "https://unitec.pucesd.edu.ec"

async function onDetect(message: any) {

    try {
        paused.value = "off";
        clearInterval(intervalGUI);
        const message_encoded = decodeURIComponent(escape(atob(message)));

        data.value = JSON.parse(message_encoded.replaceAll("'", '"'));
        const result = await checkAccess(data.value);

        visitor.value.nombre = result.visitante
        valid_until.value = result.valido_hasta == 0 ? moment('20991231').format("Y-MM-DD") : moment(result.valido_hasta).format("Y-MM-DD")
        isAuthorized.value = result.estado == 'valido' ? AccessStatus.authorized : AccessStatus.unauthorized;
        loading.value = false;


    } catch (error) {
        console.log(error);

    } finally {
        paused.value = "off";
        setTimeout(() => {
            paused.value = "auto";
        }, 1);
        resetGUI();
    }


}

async function checkAccess(info: DecodedMessage | any) {
    const isNative = !getPlatforms().includes('desktop')
    const options: HttpOptions = {
        url: isNative ? `${server}/api/visitas/check-access/${info.id}` : `/api/visitas/check-access/${info.id}`,
        // url: `http://localhost:8069/api/visitas/check-access/${info.id}`,
        headers: { 'Content-Type': 'application/json' },
        data: {
            params: { id: info.id }
        },
        method: "POST"

    }
    const response = await Http.request(options);
    console.log(response);

    return response.data.result
}

function resetGUI() {
    intervalGUI = setTimeout(() => {
        visitor.value.nombre = "";
        valid_until.value = "";
        isAuthorized.value = AccessStatus.pending;
        loading.value = true;
    }, timeToReset * 1000)
}


</script>

<template>
    <ion-page>

        <ion-content :fullscreen="true">
            <ion-card>
                <ion-card-content v-show="paused == 'auto'" class="cam-container">
                    <qrcode-stream :camera="paused" @decode="onDetect"></qrcode-stream>
                </ion-card-content>
            </ion-card>
            <ion-item>
                <ion-label>
                    <p>Visitante</p>
                    <h1 v-text="visitor.nombre"></h1>
                </ion-label>
            </ion-item>
            <ion-item>
                <ion-label>
                    <p>Válido Hasta</p>
                    <h1 v-text="valid_until"></h1>
                </ion-label>
            </ion-item>
            <ion-item lines="none">
                <div class="access">
                    <ion-chip v-if="isAuthorized == AccessStatus.authorized">INGRESO AUTORIZADO</ion-chip>
                    <ion-chip v-else-if="isAuthorized == AccessStatus.unauthorized" class="unauthorized">INGRESO NO
                        AUTORIZADO</ion-chip>
                </div>
            </ion-item>
            <ion-item lines="none">
                <ion-progress-bar v-if="loading" type="indeterminate"></ion-progress-bar>
            </ion-item>
            <div class="img-container">
                <img class="img-logo" src="/assets/LogoPUCESD.png" />
            </div>
        </ion-content>
        <footer>
            <div class="footer-container">
                <ion-text color="medium">
                    <small>Desarrollado en DTI - PUCESD por Ing. Jonathan Moreno</small>
                </ion-text>
            </div>
        </footer>
    </ion-page>
</template>

<style>
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

.img-logo {
    width: 50vw;
}

.img-container {
    margin: 0 auto;
    text-align: center;
}
</style>