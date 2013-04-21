<?php

//setup database
try {
        $dbh = new PDO("mysql:host=localhost;dbname=lalaws" , 'root', 'likes69');
    }
catch(PDOException $e)
    {
        echo $e->getMessage();
    }

$q = $dbh->prepare("select * from crim_code");

$q->execute();

$r = $q->fetchAll(PDO::FETCH_ASSOC);

$data = json_encode($r);

file_put_contents('data.json',$data);
