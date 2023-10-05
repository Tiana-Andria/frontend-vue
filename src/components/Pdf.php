<?php

use Http\Adapter\Guzzle6\Client as G6client;
use TheCodingMachine\Gotenberg\Client;
use TheCodingMachine\Gotenberg\DocumentFactory;
use TheCodingMachine\Gotenberg\HTMLRequest;
use TheCodingMachine\Gotenberg\Request;

class Pdf extends MX_Controller
{


    public function __construct()
    {
        parent::__construct();
    }

    private static $RESPONSE = array(
        "errCode" => 0,
        "message" => "success",
        "result" => null
    );


    /**
     * get html content 
     */
    private function _getContent($html)
    {
        $_data = array(
            'html' => $html
        );

        ob_start();
        $this->load->view('pdf', $_data);
        return ob_get_clean();
    }

    /**
     * change link's css : 
     * @format : http//location/assets/folder/file.css => assets/folder/file.css
     */
    private function _formatLinks($style)
    {
        $assets = array();
        $style = json_decode($style);
        foreach ($style as $link) {
            # code...  
            $sansVersion = explode('?', $link->href)[0];
            $sansVersion = explode('/', $sansVersion);
            array_shift($sansVersion);
            array_shift($sansVersion);
            array_shift($sansVersion);
            $sansVersion = join('/', $sansVersion);

            $arr_href = explode("/", $sansVersion);

            array_push($assets, DocumentFactory::makeFromPath($arr_href[sizeof($arr_href) - 1],  $sansVersion));
        }
        return $assets;
    }

    public function export()
    {
        // disable error
        // error_reporting(0);

        $response = self::$RESPONSE;
        try {
            extract($_POST);
            $toPrint = $this->_getContent($html);
            $assets = $this->_formatLinks($style); // set all assets...
            $client = new Client('http://localhost:3000', new G6client());
            $files = DocumentFactory::makeFromString('fichier.html', $toPrint);

            $request = new HTMLRequest($files);
            $request->setAssets($assets);
            $request->setMargins(Request::NO_MARGINS);

            $dest = 'Export/'. $fileName .'.pdf';
            try {
                $client->store($request, $dest); 
                $response = array(
                    "errCode" => 1,
                    "message" => "Exportation réussit",
                );
            } catch (Exception $e) {
                preg_match("/cURL/", $e->getMessage(), $exist);
                if ($exist) {
                    $response = array(
                        "errCode" => 601,
                        "message" => "Impossible de se connectée à Gotenberg",
                    );
                } else {
                    $toStream = array_pop(explode("/", $dest));
                    $response = array(
                        "errCode" => 601,
                        "message" => "Impossible d'ecrire dans " . $toStream,
                    );
                }
            }
            echo json_encode($response);
        } catch (Exception $th) {
            var_dump($th->getMessage());
            return $th;
        }
        if (
            ENVIRONMENT == "development"
        ) error_reporting(E_ALL);
    }
}
