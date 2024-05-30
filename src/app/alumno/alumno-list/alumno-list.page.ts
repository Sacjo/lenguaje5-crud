import { Component, OnInit } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { AlertController, InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-alumno-list',
  templateUrl: './alumno-list.page.html',
  styleUrls: ['./alumno-list.page.scss'],
})
export class AlumnoListPage implements OnInit {
  constructor(
    private readonly firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  listaAlumnos = new Array();
  maxResults = 15;
  ultimoAlumnoRecuperado: any = null;
  isSearch: boolean = false;
  query = '';

  ngOnInit() {
    this.listaAlumnos = new Array();
    this.ultimoAlumnoRecuperado = null;
    this.listarAlumnosSinFiltro();
  }

  ionViewWillEnter() {
    this.listaAlumnos = new Array();
    this.ultimoAlumnoRecuperado = null;
    this.listarAlumnosSinFiltro();
  }

  listarAlumnosSinFiltro = () => {
    console.log('Listar alumnos');
    const alumnosRef = collection(this.firestore, 'alumno');

    let q;
    if (this.ultimoAlumnoRecuperado) {
      q = query(
        alumnosRef,
        limit(this.maxResults),
        startAfter(this.ultimoAlumnoRecuperado)
      );
    } else {
      q = query(alumnosRef, limit(this.maxResults));
    }

    //metodo viejo para scroll infinito

    // getDocs(q).then((re) => {
    //   if (!re.empty && re.docs.length > 0) {
    //     this.ultimoAlumnoRecuperado = re.docs[re.docs.length - 1];
    //     re.docs.forEach((doc) => {
    //       let alumno: any = doc.data();
    //       alumno.id = doc.id;
    //       this.listaAlumnos.push(alumno);
    //     });
    //   } else {
    //     // Manejo cuando no hay más datos que cargar
    //     console.log('No hay más alumnos para cargar.');
    //   }
    // });

    //metodo nuevo para scroll infinito

    const querySnapshot = getDocs(q).then((re) => {
      if (!re.empty) {
        this.ultimoAlumnoRecuperado = re.docs[re.docs.length - 1];

        re.forEach((doc) => {
          let alumno: any = doc.data();
          alumno.id = doc.id;
          this.listaAlumnos.push(alumno);
        });
      }
    });

    console.log(this.listaAlumnos);
  };

  onIonInfinite(ev: any) {
    this.listarAlumnosSinFiltro();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  // listarAlumnosSinFiltro = () => {
  //   console.log('Listar alumnos');
  //   const alumnosRef = collection(this.firestore, 'alumno');
  //   collectionData(alumnosRef, { idField: 'id' }).subscribe((respuesta) => {
  //     this.listaAlumnos = respuesta;
  //     console.log('estos son los alumnos', respuesta);
  //   });
  // };

  async noTanRapido() {
    const alert = await this.alertCtrl.create({
      header: '¡Espera un momento!',
      message: 'No tan rápido, aún no llegamos ahí.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  //nuevo codigo para la segunda parcial

  clickSearch = () => {
    this.isSearch = true;
  };

  clearSearch = () => {
    this.isSearch = false;
    this.query = '';

    this.listaAlumnos = new Array();
    this.ultimoAlumnoRecuperado = null;

    this.listarAlumnosSinFiltro();
  };

  buscarSearch = (e: any) => {
    this.isSearch = false;
    this.query = e.target.value;

    this.listaAlumnos = new Array();
    this.ultimoAlumnoRecuperado = null;
    this.listarAlumnos();
  };

  listarAlumnos = () => {
    console.log("listar alumnos");
    const alumnosRef = collection(this.firestore, 'alumno');

    if ((this.query+"").length > 0){
      let q = undefined;
      if (this.ultimoAlumnoRecuperado){
        q= query(alumnosRef,
          where ("nombre", ">=", this.query.toUpperCase()),
          where ("nombre", "<=", this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults),
          startAfter(this.ultimoAlumnoRecuperado));
      } else {
        q= query(alumnosRef,
          where ("nombre", ">=", this.query.toUpperCase()),
          where ("nombre", "<=", this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults));
      }

      getDocs(q).then(re => {
        if (!re.empty){
          let listaAlumnos = new Array();

          //Retirar lo que no corresponde
          for (let i= 0; i < re.docs.length; i++){
            const doc : any = re.docs[i].data();
            if(doc.nombre.toUpperCase().
                  startsWith(
                      this.query.toUpperCase().charAt(0) 
            )){
              listaAlumnos.push(re.docs[i])
            }

            
          }

          this.ultimoAlumnoRecuperado = re.docs[listaAlumnos.length-1];

            for(let i = 0; i < listaAlumnos.length; i++){
              const doc : any = listaAlumnos[i];
              //console.log("queryy", doc.id, "data", doc.data());
              let alumno : any = doc.data();
              alumno.id = doc.id;
              this.listaAlumnos.push(alumno);
            };

        }
      });

    } else {
      this.listarAlumnosSinFiltro();
    }

  }

}
