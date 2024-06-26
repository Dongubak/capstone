import React, { useCallback, useEffect, useState } from "react";
import { where, getDocs, collection, query, doc, getDoc } from "firebase/firestore";
import { authService, db } from "../../fbInstance";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearSelect, initLesson, selectLesson } from "../../modules/lesson";
import SetTimeTable from "../../components/setTimeTable/SetTimeTable";
import LessonList from "../../components/setTimeTable/LessonList";
import axios from 'axios';
import useAuthStateChanged from "../../modules/useAuthStateChanged";



const SetTimeTableContainer = () => {
   const {select} = useSelector(state => state.lessons);
   const {uid} = useSelector(state => state.login);

   const [value, setValue] = useState('');
   const [type, setType] = useState('subject');
   const dispatch = useDispatch();
   
   const onChange = useCallback((e) => {
      setValue(e.target.value);
   }, []);

   const onSearch = useCallback(async (e) => {
      e.preventDefault();


      try {
         /// 수정해야하는 부분 1
         const response = await axios.post('http://localhost:3001/lesson/getSearchedLessons', {
            keyword: value,
            type
         })
          /// 예시) 강영흥 검색하면 교수명이 강영흥인 강의들을 모두 불러옴
          

          
          console.log(response.data);

         //  [{강의 1}, {강의 2}]

          /// 강영흥인 강의들 리스트를 selectLesson(-----)
         await dispatch(selectLesson(response.data));

      } catch (error) {
          console.error('Error while searching:', error);
      }
  }, [type, value]);
  
  async function getQuerySnapshot(q) {
      const querySnapshot = await getDocs(query(
          q,
          where(type, '>=', value),
          where(type, '<=', value + '\uf8ff')
      ));
      return querySnapshot;
  }


   const onCheckOnlyOne = useCallback((checkThis) => {
      const checkboxes = document.getElementsByName('filter')
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i] !== checkThis.target) {
          checkboxes[i].checked = false
        }
      }
      setType(checkThis.target.value);
    }, [type]);

   
    ///초기 사용자 강의정보 렌더링 할 때
   // useEffect(() => {
   //    (async function() {
   //       const docRef = doc(db, 'user', localStorage.getItem("uid"));
   //       const docSnap = await getDoc(docRef);
   //       await dispatch(initLesson(docSnap.data().table));
   //    })();
   
   //    return () => {
   //       dispatch(clearSelect());
   //    }
   // }, []);

   useEffect(() => {
      const {uid} = JSON.parse(localStorage.getItem('user'));
      console.log(uid);
      const initData = async () => {
         try {
            const response = await axios.post('http://localhost:3001/api/init_lesson', {uid});
            console.log(response.data);
            await dispatch(initLesson(response.data));
         } catch(e) {
            console.log(e);
         }
      }

      initData();
   }, []);

   return (
      <div>
         <div>
            <SetTimeTable onChange={onChange} onCheckOnlyOne={onCheckOnlyOne} onSearch={onSearch} value={value}></SetTimeTable>
         </div>
         <Outlet></Outlet>
         <LessonList datas={select}></LessonList>
      </div>
      
   )
}

export default SetTimeTableContainer;