# GPERI Result Server

> Developed in NodeJS and MongoDB

### API (Return data in JSON formate)

* Add data using GPERI Result Scrapper
  ``` 
  http://server-ip:3000/ [POST Request]
  ``` 
 <hr/>
 
* Get Student Information 
  ``` 
  http://server-ip:3000/student [POST Request] 
  ``` 
  > params : name or enrollment
 <hr/>
    
* Get Search List of Student by Name or enrollment Number
  ``` 
  http://server-ip:3000/search [POST Request]
  ``` 
  > params : name or enrollment
 <hr/>

* Get Semesters on selected branch
  ``` 
  http://server-ip:3000/sem [POST Request]
  ``` 
  > params : branch and year
 <hr/> 

* Return batches of branch
  ``` 
  http://server-ip:3000/years [POST Request]
  ``` 
  > params : branch
 <hr/> 

* Get the semester wise result (all semester data)
  ``` 
  http://server-ip:3000/branch [POST Request]
  ``` 
  > params : branch, year and sem
 <hr/> 

* Return brach top 3 students
  ``` 
  http://server-ip:3000/branchtop [POST Request]
  ``` 
  > params : branch
 <hr/> 

* Return collage top 3 students
  ``` 
  http://server-ip:3000/collagetop [POST Request]
  ``` 
 <hr/> 


