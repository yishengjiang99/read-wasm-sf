<?php
$mysql = mysql_connect("localhost", "root", "");
mysql_select_db("grepsf2");
$res=mysql_query($mysql, "select now()");