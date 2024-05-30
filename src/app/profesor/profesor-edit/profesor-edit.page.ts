import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profesor-edit',
  templateUrl: './profesor-edit.page.html',
  styleUrls: ['./profesor-edit.page.scss'],
})
export class ProfesorEditPage implements OnInit {
  registroForm = new FormGroup({
    id: new FormControl(''),
    nombre: new FormControl(''),
    apellido: new FormControl(''),
    documento: new FormControl(''),
    casado: new FormControl(false),
    registro: new FormControl(''),
  });

  profesorId: string | null = null;

  profesor: any = {};

  fechaSeleccionada: string = '';

  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      console.log(params);
      this.profesorId = params.id;
    });
    if (this.profesorId) {
      this.obtenerProfesor(this.profesorId);
    } else {
      this.fechaSeleccionada = new Date().toISOString();
    }
    console.log('fecha normal', this.fechaSeleccionada);
  }

  onDatetimeChange(event: any) {
    console.log('Fecha y hora seleccionadas:', event.detail.value);
    this.fechaSeleccionada = event.detail.value;
    this.registroForm.get('registro')?.setValue(this.fechaSeleccionada);
  }

  incluirProfesor = () => {
    console.log('Aqui incluir en firebase');
    let profesoresRef = collection(this.firestore, 'profesores');

    const registroTimestamp = Timestamp.fromDate(
      new Date(this.fechaSeleccionada)
    );
    const formValue = {
      ...this.registroForm.value,
      registro: registroTimestamp,
    };

    addDoc(profesoresRef, formValue)
      .then((doc) => {
        console.log('Registro hecho');
        this.router.navigate(['/profesor-list']);
      })
      .catch((error) => {
        console.error('Error al crear el Profesor:', error);
      });
  };

  editarProfesor = (id: string) => {
    console.log('Aqui editar en firebase');
    let document = doc(this.firestore, 'profesores', id);

    const registroTimestamp = Timestamp.fromDate(
      new Date(this.fechaSeleccionada)
    );

    const formValue = {
      ...this.registroForm.value,
      registro: registroTimestamp,
    };

    updateDoc(document, formValue)
      .then((doc) => {
        console.log('Registro editado');
        this.router.navigate(['/profesor-list']);
      })
      .catch((error) => {
        console.error('Error al editar el Profesor:', error);
      });
  };

  obtenerProfesor = (id: string) => {
    console.log('Listar profesor');
    let documentRef = doc(this.firestore, 'profesores', id);

    getDoc(documentRef)
      .then((doc) => {
        if (doc.exists()) {
          console.log('Detalle del profesor:', doc.data());
          this.profesor = doc.data();
          this.fechaSeleccionada =  this.profesor['registro']?.toDate().toISOString() || '';

          console.log(this.fechaSeleccionada);

          this.registroForm.setValue({
            id: this.profesorId || '',
            nombre: this.profesor['nombre'] || '',
            apellido: this.profesor['apellido'] || '',
            documento: this.profesor['documento'] || '',
            casado: this.profesor['casado'] || false,
            registro: this.fechaSeleccionada,
          });
        } else {
          console.log('No se encontró el profesor con el ID proporcionado.');
        }
      })
      .catch((error) => {
        console.error('Error al consultar el alumno:', error);
      });
  };

  incluirOEditarProfesor() {
    if (this.profesorId) {
      this.editarProfesor(this.profesorId);
    } else {
      this.incluirProfesor();
    }
  }
}
