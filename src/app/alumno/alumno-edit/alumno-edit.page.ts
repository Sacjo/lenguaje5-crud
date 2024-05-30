import { Component, OnInit } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  Firestore,
  doc,
  getDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  uploadBytesResumable,
  ref,
  Storage,
  getDownloadURL,
  StorageError,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-alumno-edit',
  templateUrl: './alumno-edit.page.html',
  styleUrls: ['./alumno-edit.page.scss'],
})
export class AlumnoEditPage implements OnInit {
  registroForm = new FormGroup({
    id: new FormControl(''),
    codigo: new FormControl(''),
    nombre: new FormControl(''),
    apellido: new FormControl(''),
  });

  alumnoId: string | null = null;

  alumno: any = {};

  avatar: string = '';

  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {}

  ngOnInit() {
    //this.incluirAlumno();
    //this.editarAlumno('2hp0FTNb7Kyrch5gCczE');
    //this.listarAlumno('2hp0FTNb7Kyrch5gCczE');

    //como el profe muestra
    this.route.params.subscribe((params: any) => {
      console.log(params);
      this.alumnoId = params.id;
    });

    // this.alumnoId = this.route.snapshot.paramMap.get('id'); //segun gpt
    if (this.alumnoId) {
      this.obtenerAlumno(this.alumnoId);
    }
  }

  incluirAlumno = () => {
    console.log('Aqui incluir en firebase');
    let alumnosRef = collection(this.firestore, 'alumno');

    addDoc(alumnosRef, this.registroForm.value)
      .then((doc) => {
        console.log('Registro hecho');
        this.router.navigate(['/alumno-list']);
      })
      .catch((error) => {
        console.error('Error al crear el alumno:', error);
      });
  };

  editarAlumno = (id: string) => {
    console.log('Aqui editar en firebase');
    let document = doc(this.firestore, 'alumno', id);

    updateDoc(document, this.registroForm.value)
      .then((doc) => {
        console.log('Registro editado');
        this.router.navigate(['/alumno-list']);
      })
      .catch((error) => {
        console.error('Error al editar el alumno:', error);
      });
  };

  obtenerAlumno = (id: string) => {
    console.log('Listar alumno');
    let documentRef = doc(this.firestore, 'alumno', id);

    getDoc(documentRef)
      .then((doc) => {
        if (doc.exists()) {
          this.obtenerAvatarAlumno();

          console.log('Detalle del alumno:', doc.data());
          this.alumno = doc.data();
          this.registroForm.setValue({
            id: this.alumnoId || '',
            codigo: this.alumno['codigo'] || '',
            nombre: this.alumno['nombre'] || '',
            apellido: this.alumno['apellido'] || '',
          });
        } else {
          console.log('No se encontró el alumno con el ID proporcionado.');
        }
      })
      .catch((error) => {
        console.error('Error al consultar el alumno:', error);
      });
  };

  eliminarAlumno = (id: string) => {
    console.log('Aqui elimina en firebase');
    const document = doc(this.firestore, 'alumno', id);

    deleteDoc(document)
      .then(() => {
        console.log('Registro eliminado');
        this.router.navigate(['/alumno-list']);
      })
      .catch((error) => {
        console.error('Error al eliminar el alumno:', error);
      });
  };

  incluirOEditarAlumno() {
    if (this.alumnoId) {
      this.editarAlumno(this.alumnoId);
    } else {
      this.incluirAlumno();
    }
  }

  //nuevo codigo para la segunda parcial

  uploadFile = (input: HTMLInputElement) => {
    if (!input.files) return;

    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        console.log(file, file.name);
        const storageRef = ref(this.storage, `avatars/alumno/${this.alumnoId}`);

        uploadBytesResumable(storageRef, file).on(
          'state_changed',
          this.onUploadChange,
          this.onUploadError,
          this.onUploadComplete
        );
      }
    }
  };

  onUploadChange = (response: UploadTaskSnapshot) => {
    console.log('onUploadChange', response);
  };

  onUploadError = (error: StorageError) => {
    console.log('onUploadError', error);
  };

  onUploadComplete = () => {
    console.log('upload completo');
    this.editarAvatar();
    this.obtenerAvatarAlumno();
  };

  editarAvatar = () => {
    const document = doc(this.firestore, 'alumno', this.alumnoId!);
    updateDoc(document, {
      avatar: `avatars/alumno/${this.alumnoId}`,
    }).then((doc) => {
      console.log('Avatar editado');
    });
  };

  obtenerAvatarAlumno = () => {
    const storageRef = ref(this.storage, `avatars/alumno/${this.alumnoId}`);
    console.log('storageRef', storageRef);

    getDownloadURL(storageRef).then((doc) => {
      this.avatar = doc;
    });
  };
}
