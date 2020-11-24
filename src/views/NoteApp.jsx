import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { addNote, updateNote, removeNote } from "../store/actions/noteActions";
import { loadUser, logout } from '../store/actions/userActions';
import { SideBar } from '../cmps/SideBar';
import { TopBar } from '../cmps/TopBar';
import { useState } from 'react';

export function NoteApp({ history }) {
  const dispatch = useDispatch();
  //GLOBAL STATE
  const { loggedUser } = useSelector((state) => state.userReducer);
  //LOCAL STATE
  const [defaultNote, setDefaultNote] = useState(null)
  const [currNote, setCurrNote] = useState(null)
  const [isUnsaved, setisUnsaved] = useState(false)


  //If user is not logged then move to home
  useEffect(() => {
    console.log('if (!loggedUser) history.push("/")',)

    if (!loggedUser) history.push("/")
    else {
      dispatch(loadUser(loggedUser._id))
      _setNotes(loggedUser.notes[loggedUser.notes.length - 1])
    }
  }, [])

  //Detect changes, if changes were made show unsaved icon
  useEffect(() => {
    if (defaultNote && (defaultNote.body !== currNote.body || defaultNote.title !== currNote.title)) {
      setisUnsaved(true)
    } else setisUnsaved(false)
  }, [currNote, defaultNote])

  //Listen to window key presses
  useEffect(() => {
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  });

  //On logged user note length change AKA remove,add - reload and set notes.
  useEffect(() => {
    if (!loggedUser) return
    _setNotes(loggedUser.notes[loggedUser.notes.length - 1] || null)
  }, [loggedUser && loggedUser.notes.length])

  //if window key Ctrl+S then save curr note
  function onWindowKey(ev) {
    if (ev.ctrlKey && ev.key === 's') {
      ev.preventDefault()
      onUpdateNote(currNote)
    }
  }

  //---------------CRUD-----------------
  function onAddNote() {
    dispatch(addNote(loggedUser))
  }
  function onRemoveNote() {
    dispatch(removeNote(currNote._id, loggedUser))
  }
  function onUpdateNote() {
    dispatch(updateNote(currNote, loggedUser))
    setDefaultNote(currNote)
  }

  //--------------------------------
  async function onLogOut() {
    await dispatch(logout())
    console.log('onLogOut() history.push("/")',)
    history.push("/")
  }
  function onNoteSelect(note) {
    _setNotes(note)
  }
  function onNoteChange(ev) {
    const target = ev.target
    setCurrNote(prevState => {
      return {
        ...prevState,
        [target.name]: target.value

      }
    })
  }
  function _setNotes(note) {
    setDefaultNote(note)
    setCurrNote(note)
  }
  if (!loggedUser) {
    return <h1>Loading...</h1>
  }
  return (
    <section className="note-app flex">
      <div className="col-left flex">
        <SideBar
          notes={loggedUser.notes}
          onNoteSelect={onNoteSelect}
          onAddNote={onAddNote}

        />
      </div>

      <div className="col-right col flex ">
        <TopBar
          isUnsaved={isUnsaved}
          currNote={currNote}
          user={loggedUser}
          onUpdateNote={onUpdateNote}
          onRemoveNote={onRemoveNote}
          onLogOut={onLogOut} />
        {currNote && loggedUser.notes.length !== 0 ?
          <textarea
            name="body"
            value={currNote.body}
            onChange={onNoteChange}
            className="editor h100"
          ></textarea>

          :
          <h1>No notes left!</h1>
        }

      </div>
    </section>
  );
}


